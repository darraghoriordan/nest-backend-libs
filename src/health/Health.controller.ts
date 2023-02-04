import {Controller, Get} from "@nestjs/common";
import {Transport} from "@nestjs/microservices";
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {
    HealthCheckService,
    HttpHealthIndicator,
    HealthCheck,
    HealthCheckResult,
    TypeOrmHealthIndicator,
    MicroserviceHealthIndicator,
} from "@nestjs/terminus";

@Controller("health")
@ApiTags("Application Support")
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private database: TypeOrmHealthIndicator,
        private microservice: MicroserviceHealthIndicator
    ) {}

    @Get()
    @HealthCheck()
    @ApiOkResponse()
    async check(): Promise<HealthCheckResult> {
        return this.health.check([
            () =>
                this.http.pingCheck(
                    "frontend-app",
                    process.env.FRONTEND_APP_URL || "http://localhost"
                ),
            () =>
                this.http.pingCheck(
                    "backend-api",
                    process.env.BACKEND_APP_URL || "http://localhost"
                ),
            () => this.database.pingCheck("app-database"),
            () =>
                this.microservice.pingCheck("app-redis", {
                    transport: Transport.REDIS,
                    options: {url: process.env.REDIS_URL},
                }),
        ]);
    }
}
