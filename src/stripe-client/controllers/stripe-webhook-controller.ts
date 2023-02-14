import {InjectQueue} from "@nestjs/bull";
import {
    Controller,
    Get,
    Post,
    RawBodyRequest,
    Req,
    UseGuards,
} from "@nestjs/common";
import {
    ApiTags,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiBearerAuth,
} from "@nestjs/swagger";
import {Queue} from "bull";
import {Request as ExpressRequest} from "express";
import {
    ClaimsAuthorisationGuard,
    DefaultAuthGuard,
    MandatoryUserClaims,
} from "../../authz";
import {StripeWebhookHandler} from "./../services/stripe-webhook-handler.service";
import {QueueItemDto} from "../../root-app/models/QueueItemDto";

/*
 * This is a controller that is used to receive webhooks from Stripe.
 * It is not used to send requests to Stripe.
 * It is automatically registered by the StripeClientModule.
 */
@Controller("payments/stripe")
@ApiTags("Payments")
export class StripeWebhookController {
    constructor(
        private readonly stripeWebhookService: StripeWebhookHandler,
        @InjectQueue("stripe-events")
        private queue: Queue
    ) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    @Post("webhook-receiver")
    @ApiOkResponse()
    @ApiBadRequestResponse()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unicorn/prevent-abbreviations
    async webhookReceiver(@Req() req: RawBodyRequest<ExpressRequest>) {
        return this.stripeWebhookService.handleWebhook(req);
    }

    @UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
    @ApiBearerAuth()
    @MandatoryUserClaims("modify:all")
    @Get("peekalljobs")
    @ApiOkResponse({type: [QueueItemDto]})
    async peekQueueJobs(): Promise<QueueItemDto[]> {
        const jobs = await this.queue.getJobs([
            "waiting",
            "active",
            "delayed",
            "completed",
            "failed",
            "paused",
        ]);

        return jobs.map((job) => {
            return {
                id: job.id.toString(),
                queueDateLocal: new Date(job.processedOn || 1),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                result: job.returnvalue,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                data: job.data,
                failReason: job.failedReason,
            };
        });
    }

    @UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
    @ApiBearerAuth()
    @MandatoryUserClaims("modify:all")
    @Get("peekfailedjobs")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @ApiOkResponse({type: [QueueItemDto]})
    async peekFailedQueueJobs(): Promise<QueueItemDto[]> {
        const jobs = await this.queue.getJobs(["delayed", "failed"]);

        return jobs.map((job) => {
            return {
                id: job.id.toString(),
                queueDateLocal: new Date(job.processedOn || 1),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                result: job.returnvalue,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                data: job.data,
                failReason: job.failedReason,
            };
        });
    }
}
