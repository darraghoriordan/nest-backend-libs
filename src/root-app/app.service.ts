import {Injectable} from "@nestjs/common";

@Injectable()
export class AppService {
    getHello() {
        return {result: "Healthy and running"};
    }
}
