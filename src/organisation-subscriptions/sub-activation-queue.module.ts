import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";

const SubActivationBullQueueModule = BullModule.registerQueue({
    name: "subscription-activation-changed",
});

@Module({
    imports: [SubActivationBullQueueModule],
    exports: [SubActivationBullQueueModule],
})
export class SubActivationQueueModule {}
