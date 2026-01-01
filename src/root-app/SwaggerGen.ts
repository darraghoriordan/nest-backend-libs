import {INestApplication, Injectable, Logger} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import fs from "fs";
import {spawn} from "child_process";
import {CoreConfigurationService} from "../core-config/CoreConfigurationService.js";

/* istanbul ignore next */
@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class SwaggerGen {
    constructor(private config: CoreConfigurationService) {}
    private readonly logger = new Logger(SwaggerGen.name);
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
        const swaggerPath = this.config.globalPrefix
            ? `${this.config.globalPrefix}/swagger`
            : "swagger";
        SwaggerModule.setup(swaggerPath, app, document);

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
