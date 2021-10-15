import {INestApplication, Injectable} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import fs from "fs";

import {spawn} from "child_process";
import CoreLoggerService from "../logger/CoreLoggerService";

/* istanbul ignore next */
@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class SwaggerGen {
    constructor(private logger: CoreLoggerService) {}
    public generate(app: INestApplication, pathToSave: string): void {
        if (!SwaggerGen.runOnThisEnvironment(process.env.GENERATE_SWAGGER)) {
            this.logger.log(
                "Skipping swagger model generation for this environment"
            );
            return;
        }
        const config = new DocumentBuilder()
            .addBearerAuth()
            .setTitle("Coin bot Api")
            .setDescription("Describes the backend api")
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup("api", app, document);

        // tslint:disable-next-line: non-literal-fs-path
        fs.writeFileSync(pathToSave, JSON.stringify(document));
        this.logger.log(`Wrote swagger api doc to ${pathToSave}`);

        const modelGenerator = spawn("./generate.sh", {
            stdio: ["ignore", "ignore", "inherit"],
            shell: true,
        });

        modelGenerator.on("exit", () => {
            this.logger.log("Regenerated shared api models");
        });
    }

    public static runOnThisEnvironment(generateSwagger?: string): boolean {
        return generateSwagger?.toLowerCase() === "true";
    }
}
