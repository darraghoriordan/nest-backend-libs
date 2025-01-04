import {Injectable} from "@nestjs/common";
import {ApiProperty} from "@nestjs/swagger";

export class HealthResponse {
    @ApiProperty()
    result!: string;
}
@Injectable()
export class AppService {
    getHello(): HealthResponse {
        return {result: "Healthy and running"};
    }
}
