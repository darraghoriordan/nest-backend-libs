import {InjectQueue} from "@nestjs/bullmq";
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Queue} from "bullmq";
import {LessThan, Repository} from "typeorm";
import {StripeCheckoutEvent} from "../entities/stripe-payment-event.entity.js";

export interface StripePaymentsOperationsSnapshot {
    status: "up" | "degraded";
    checkedAt: string;
    events: {
        received: number;
        processing: number;
        failed: number;
        staleProcessing: number;
    };
    queue: {
        waiting: number;
        active: number;
        delayed: number;
        failed: number;
    };
}

@Injectable()
export class StripePaymentsOperationsService {
    constructor(
        @InjectRepository(StripeCheckoutEvent)
        private readonly eventRepository: Repository<StripeCheckoutEvent>,
        @InjectQueue("stripe-events") private readonly eventQueue: Queue
    ) {}

    async getSnapshot(): Promise<StripePaymentsOperationsSnapshot> {
        const staleCutoff = new Date(Date.now() - 5 * 60 * 1000);
        const [received, processing, failed, staleProcessing, queueCounts] =
            await Promise.all([
                this.eventRepository.countBy({status: "received"}),
                this.eventRepository.countBy({status: "processing"}),
                this.eventRepository.countBy({status: "failed"}),
                this.eventRepository.countBy({
                    status: "processing",
                    processingStartedAt: LessThan(staleCutoff),
                }),
                this.eventQueue.getJobCounts(
                    "waiting",
                    "active",
                    "delayed",
                    "failed"
                ),
            ]);

        return {
            status: failed > 0 || staleProcessing > 0 ? "degraded" : "up",
            checkedAt: new Date().toISOString(),
            events: {received, processing, failed, staleProcessing},
            queue: {
                waiting: queueCounts.waiting,
                active: queueCounts.active,
                delayed: queueCounts.delayed,
                failed: queueCounts.failed,
            },
        };
    }
}
