import {
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from "@nestjs/common";
import {RequestUser} from "../../authorization/models/RequestWithUser.js";
import Stripe from "stripe";
import {InjectRepository} from "@nestjs/typeorm";
import {QueryFailedError, Repository} from "typeorm";
import {
    StripeCheckoutSessionRequestDto,
    StripeCustomerPortalRequestDto,
} from "../models/secure-checkout.dto.js";
import {
    StripeCheckoutSessionResponseDto,
    StripeCustomerPortalResponseDto,
} from "../models/secure-payment-response.dto.js";
import {StripeCheckoutAttempt} from "../entities/stripe-checkout-attempt.entity.js";
import {SecureStripeProductService} from "./secure-stripe-product.service.js";
import {SecureSubscriptionService} from "./secure-subscription.service.js";

const idempotencyKeyPattern = /^[A-Za-z0-9._-]{8,255}$/;

@Injectable()
export class SecureStripeCheckoutService {
    private readonly logger = new Logger(SecureStripeCheckoutService.name);

    constructor(
        @Inject("SecureStripeClient")
        private readonly stripe: Stripe,
        @InjectRepository(StripeCheckoutAttempt)
        private readonly attemptRepository: Repository<StripeCheckoutAttempt>,
        private readonly productService: SecureStripeProductService,
        private readonly subscriptionService: SecureSubscriptionService
    ) {}

    async createCheckoutSession(
        request: StripeCheckoutSessionRequestDto,
        user: RequestUser,
        idempotencyKey: string | undefined
    ): Promise<StripeCheckoutSessionResponseDto> {
        const key = this.requireIdempotencyKey(idempotencyKey);
        this.assertOrganisationOwner(request.organisationUuid, user);
        const product = this.productService.getByKey(request.productKey);
        const successUrl = this.productService.buildRedirectUrl(
            request.successFrontendPath
        );
        const cancelUrl = request.cancelFrontendPath
            ? this.productService.buildRedirectUrl(request.cancelFrontendPath)
            : undefined;

        const existingAttempt = await this.attemptRepository.findOne({
            where: {idempotencyKey: key},
        });
        if (existingAttempt) {
            this.assertMatchingAttempt(
                existingAttempt,
                request,
                user,
                product.priceId
            );
            if (
                existingAttempt.status === "created" &&
                existingAttempt.stripeSessionId &&
                existingAttempt.stripeSessionUrl
            ) {
                return {
                    stripeSessionId: existingAttempt.stripeSessionId,
                    stripeSessionUrl: existingAttempt.stripeSessionUrl,
                };
            }
            if (
                existingAttempt.updatedDate.getTime() >
                Date.now() - 10 * 60 * 1000
            ) {
                throw new ConflictException(
                    "Checkout attempt is already in progress"
                );
            }
        }

        const attempt =
            existingAttempt ??
            this.attemptRepository.create({
                idempotencyKey: key,
                organisationUuid: request.organisationUuid,
                userUuid: user.uuid,
                productKey: product.key,
                priceId: product.priceId,
                mode: product.mode,
                status: "creating",
            });
        attempt.status = "creating";
        attempt.errorMessage = undefined;
        try {
            await this.attemptRepository.save(attempt);
        } catch (error) {
            if (!this.isUniqueViolation(error)) {
                throw error;
            }
            const concurrentAttempt = await this.attemptRepository.findOne({
                where: {idempotencyKey: key},
            });
            if (!concurrentAttempt) {
                throw error;
            }
            this.assertMatchingAttempt(
                concurrentAttempt,
                request,
                user,
                product.priceId
            );
            if (
                concurrentAttempt.status === "created" &&
                concurrentAttempt.stripeSessionId &&
                concurrentAttempt.stripeSessionUrl
            ) {
                return {
                    stripeSessionId: concurrentAttempt.stripeSessionId,
                    stripeSessionUrl: concurrentAttempt.stripeSessionUrl,
                };
            }
            throw new ConflictException(
                "Checkout attempt is already in progress"
            );
        }

        try {
            const metadata = {
                organisationUuid: request.organisationUuid,
                userUuid: user.uuid,
                productKey: product.key,
                internalSku: product.internalSku,
                checkoutAttemptId: String(attempt.id),
            };
            const session = await this.stripe.checkout.sessions.create(
                {
                    mode: product.mode,
                    client_reference_id: String(attempt.id),
                    line_items: [{price: product.priceId, quantity: 1}],
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    metadata,
                    ...(product.mode === "subscription"
                        ? {subscription_data: {metadata}}
                        : {payment_intent_data: {metadata}}),
                },
                {idempotencyKey: key}
            );
            if (!session.url) {
                throw new Error("Stripe did not return a Checkout URL");
            }

            attempt.status = "created";
            attempt.stripeSessionId = session.id;
            attempt.stripeSessionUrl = session.url;
            await this.attemptRepository.save(attempt);
            return {
                stripeSessionId: session.id,
                stripeSessionUrl: session.url,
            };
        } catch (error) {
            attempt.status = "failed";
            attempt.errorMessage =
                error instanceof Error
                    ? error.message.slice(0, 500)
                    : "Stripe error";
            await this.attemptRepository.save(attempt);
            this.logger.error("Stripe Checkout session creation failed", {
                attemptId: attempt.id,
                productKey: product.key,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new ServiceUnavailableException(
                "Unable to start checkout right now. Please try again."
            );
        }
    }

    async createCustomerPortalSession(
        request: StripeCustomerPortalRequestDto,
        user: RequestUser,
        idempotencyKey: string | undefined
    ): Promise<StripeCustomerPortalResponseDto> {
        const key = this.requireIdempotencyKey(idempotencyKey);
        const subscription = await this.subscriptionService.findByUuid(
            request.subscriptionRecordUuid
        );
        this.assertOrganisationOwner(subscription.organisation.uuid, user);
        if (!/^cus_[A-Za-z0-9]+$/.test(subscription.paymentSystemCustomerId)) {
            throw new ConflictException(
                "This subscription has no valid Stripe customer"
            );
        }

        const session = await this.stripe.billingPortal.sessions.create(
            {
                customer: subscription.paymentSystemCustomerId,
                return_url: this.productService.buildRedirectUrl(
                    request.returnUrl
                ),
            },
            {idempotencyKey: key}
        );
        return {sessionUrl: session.url};
    }

    private requireIdempotencyKey(idempotencyKey: string | undefined): string {
        if (!idempotencyKey || !idempotencyKeyPattern.test(idempotencyKey)) {
            throw new ConflictException(
                "An Idempotency-Key header is required for payment requests"
            );
        }
        return idempotencyKey;
    }

    private assertOrganisationOwner(
        organisationUuid: string,
        user: RequestUser
    ): void {
        const isOwner = user.memberships
            ?.filter((membership) =>
                membership.roles?.some((role) => role.name === "owner")
            )
            .some(
                (membership) =>
                    membership.organisation.uuid === organisationUuid
            );
        if (!isOwner) {
            throw new ForbiddenException(
                "You are not the owner of this organisation"
            );
        }
    }

    private assertMatchingAttempt(
        attempt: StripeCheckoutAttempt,
        request: StripeCheckoutSessionRequestDto,
        user: RequestUser,
        priceId: string
    ): void {
        if (
            attempt.organisationUuid !== request.organisationUuid ||
            attempt.userUuid !== user.uuid ||
            attempt.productKey !== request.productKey ||
            attempt.priceId !== priceId
        ) {
            throw new ConflictException(
                "The Idempotency-Key was already used for another checkout"
            );
        }
    }

    private isUniqueViolation(error: unknown): boolean {
        return (
            error instanceof QueryFailedError &&
            (error as QueryFailedError & {driverError: {code?: string}})
                .driverError.code === "23505"
        );
    }
}
