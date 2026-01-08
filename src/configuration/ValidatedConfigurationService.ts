import {Injectable, OnModuleInit} from "@nestjs/common";
import {validate} from "class-validator";

@Injectable()
 
export abstract class ValidatedConfigurationService implements OnModuleInit {
    async onModuleInit(): Promise<void> {
        const result = await validate(this);
        if (result.length > 0) {
            const json = JSON.stringify(
                result.map((v) => {
                    return {
                        property: v.property,
                        constraints: v.constraints,
                    };
                }),
                undefined,
                2
            );
            throw new Error(
                `Configuration failed - Is there an environment variable missing? 
${json}`
            );
        }
    }
}
