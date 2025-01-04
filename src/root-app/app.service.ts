import {Injectable} from "@nestjs/common";

@Injectable()
export class AppService {
    getHello(): string {
        return '{result: "Healthy and running"}';
    }
}
