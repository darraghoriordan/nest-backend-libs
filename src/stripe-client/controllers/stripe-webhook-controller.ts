import {InjectQueue} from "@nestjs/bullmq";
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
    ApiOperation,
} from "@nestjs/swagger";
import {Queue} from "bullmq";
import {Request as ExpressRequest} from "express";
import {StripeWebhookHandler} from "./../services/stripe-webhook-handler.service.js";
import {QueueItemDto} from "../../root-app/models/QueueItemDto.js";
import {ClaimsAuthorisationGuard} from "../../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../../authorization/guards/DefaultAuthGuard.js";
import {MandatoryUserClaims} from "../../authorization/guards/MandatoryUserClaims.decorator.js";

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

    @Post("webhook-receiver")
    @ApiOkResponse()
    @ApiBadRequestResponse()
    // eslint-disable-next-line unicorn/prevent-abbreviations
    async webhookReceiver(@Req() req: RawBodyRequest<ExpressRequest>) {
        return this.stripeWebhookService.handleWebhook(req);
    }

    @UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
    @ApiBearerAuth()
    @ApiOperation({tags: ["SuperPower"]})
    @MandatoryUserClaims("read:all")
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
                id: job.id ?? "unknown",
                queueDateLocal: new Date(job.processedOn ?? 1),

                result: job.returnvalue,

                data: job.data,
                failReason: job.failedReason,
            };
        });
    }

    @UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
    @ApiBearerAuth()
    @ApiOperation({tags: ["SuperPower"]})
    @MandatoryUserClaims("read:all")
    @Get("peekfailedjobs")
    @ApiOkResponse({type: [QueueItemDto]})
    async peekFailedQueueJobs(): Promise<QueueItemDto[]> {
        const jobs = await this.queue.getJobs(["delayed", "failed"]);

        return jobs.map((job) => {
            return {
                id: job.id ?? "unknown",
                queueDateLocal: new Date(job.processedOn ?? 1),

                result: job.returnvalue,

                data: job.data,
                failReason: job.failedReason,
            };
        });
    }
}
