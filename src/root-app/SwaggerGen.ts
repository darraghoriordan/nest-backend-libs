import {INestApplication, Injectable} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import fs from "fs";

import {spawn} from "child_process";
import CoreLoggerService from "../logger/CoreLoggerService";
import {CoreConfigurationService} from "..";

/* istanbul ignore next */
@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class SwaggerGen {
    constructor(
        private logger: CoreLoggerService,
        private config: CoreConfigurationService
    ) {}

    public generate(app: INestApplication, pathToSave: string): void {
        if (!this.config.shouldGenerateSwagger) {
            this.logger.log(
                "Skipping swagger model generation for this environment"
            );
            return;
        }
        const config = new DocumentBuilder()
            .addBearerAuth()
            .setTitle(this.config.appTitle)
            .setDescription("Describes the backend api")
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup("swagger", app, document);

        // tslint:disable-next-line: non-literal-fs-path
        fs.writeFileSync(pathToSave, JSON.stringify(document, undefined, 2));
        this.logger.log(`Wrote swagger api doc to ${pathToSave}`);
        if (this.config.shouldAutomaticallyInstallApiModels) {
            const modelGenerator = spawn(
                "./node_modules/@darraghor/nest-backend-libs/dist/open-api-generation/generate.sh",
                {
                    stdio: ["ignore", "ignore", "inherit"],
                    shell: true,
                }
            );

            modelGenerator.on("exit", () => {
                this.logger.log("Regenerated shared api models");
            });
        }
    }
}
