import {Injectable, OnModuleInit} from "@nestjs/common";
import {validate} from "class-validator";

@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export abstract class ValidatedConfigurationService implements OnModuleInit {
    async onModuleInit(): Promise<void> {
        const result = await validate(this);
        if (result.length > 0) {
            throw new Error(
                `Configuration failed - Is there an environment variable missing? 
${JSON.stringify(
    result.map((v) => {
        return {
            property: v.property,
            constraints: v.constraints,
        };
    }),
    undefined,
    2
)}`
            );
        }
    }
}
