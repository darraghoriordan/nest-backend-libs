import {InjectQueue} from "@nestjs/bull";
import {Controller, Get, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Queue} from "bull";
import {
    DefaultAuthGuard,
    ClaimsAuthorisationGuard,
    MandatoryUserClaims,
} from "../authz";
import {BooleanResult} from "../root-app/models/boolean-result";
import {QueueItemDto} from "../root-app/models/QueueItemDto";
import {SmtpEmailClient} from "./email-client.service";

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
