import {InjectQueue} from "@nestjs/bull";
import {Controller, Get, UseGuards} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import {Queue} from "bull";
import {ClaimsAuthorisationGuard} from "../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../authorization/guards/DefaultAuthGuard.js";
import {MandatoryUserClaims} from "../authorization/guards/MandatoryUserClaims.decorator.js";
import {BooleanResult} from "../root-app/dtos/boolean-result.js";
import {QueueItemDto} from "../root-app/models/QueueItemDto.js";
import {SmtpEmailClient} from "./email-client.service.js";

@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
@ApiBearerAuth()
@ApiTags("Email-client")
@Controller("email-client")
export class EmailClientController {
    constructor(
        private readonly service: SmtpEmailClient,
        @InjectQueue("smtp-emails")
        private queue: Queue
    ) {}

    @Get("verify")
    @ApiOkResponse({type: BooleanResult})
    async verify(): Promise<BooleanResult> {
        await this.service.verify();
        return {result: true};
    }

    @MandatoryUserClaims("read:all")
    @ApiOperation({tags: ["SuperPower"]})
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

    @MandatoryUserClaims("read:all")
    @ApiOperation({tags: ["SuperPower"]})
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
