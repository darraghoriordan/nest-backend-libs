import {Controller, Get, Post, Req, UseGuards} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import {ClaimsAuthorisationGuard} from "../../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../../authorization/guards/DefaultAuthGuard.js";
import {MandatoryUserClaims} from "../../authorization/guards/MandatoryUserClaims.decorator.js";
import {InjectQueue} from "@nestjs/bullmq";
import {Job, Queue} from "bullmq";
import {
    RawStripeWebhookRequest,
    SecureStripeWebhookService,
} from "../services/secure-stripe-webhook.service.js";

@Controller("payments/stripe")
@ApiTags("Payments")
export class SecureStripeWebhookController {
    constructor(
        private readonly webhookService: SecureStripeWebhookService,
        @InjectQueue("stripe-events") private readonly eventQueue: Queue
    ) {}

    @Post("webhook-receiver")
    @ApiOkResponse({type: Object})
    @ApiBadRequestResponse()
    receiveWebhook(@Req() request: RawStripeWebhookRequest): Promise<void> {
        return this.webhookService.handleWebhook(request);
    }

    @Get("peekalljobs")
    @UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
    @MandatoryUserClaims("read:all")
    @ApiOperation({tags: ["SuperPower"]})
    @ApiOkResponse({type: [Object]})
    getQueueJobs(): Promise<unknown[]> {
        return this.getJobs([
            "waiting",
            "active",
            "delayed",
            "completed",
            "failed",
            "paused",
        ]);
    }

    @Get("peekfailedjobs")
    @UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
    @MandatoryUserClaims("read:all")
    @ApiOperation({tags: ["SuperPower"]})
    @ApiOkResponse({type: [Object]})
    getFailedQueueJobs(): Promise<unknown[]> {
        return this.getJobs(["delayed", "failed"]);
    }

    private async getJobs(
        states: Parameters<Queue["getJobs"]>[0]
    ): Promise<unknown[]> {
        const jobs = await this.eventQueue.getJobs(states);
        return jobs.map((job: Job) => ({
            id: job.id ?? "unknown",
            state: job.finishedOn
                ? "completed"
                : job.failedReason
                  ? "failed"
                  : "pending",
            eventId: (job.data as {id?: unknown}).id ?? "unknown",
            failedReason: job.failedReason,
        }));
    }
}
