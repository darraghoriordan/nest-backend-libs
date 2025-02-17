import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {PaymentSessionReference} from "./payment-session.entity.js";

@Injectable()
export class PaymentSessionService {
    constructor(
        @InjectRepository(PaymentSessionReference)
        private paymentReferenceRepository: Repository<PaymentSessionReference>
    ) {}

    async findAll(): Promise<PaymentSessionReference[]> {
        return await this.paymentReferenceRepository.find();
    }

    async findSessionByUuid(
        uuid: string
    ): Promise<PaymentSessionReference | undefined> {
        const result = await this.paymentReferenceRepository.findOne({
            where: {
                uuid,
            },
        });

        if (!result) {
            return undefined;
        }

        return result;
    }
    async createSession(parameters: {
        organisationUuid?: string;
        userUuid?: string;
    }): Promise<PaymentSessionReference> {
        const paymentReference = this.paymentReferenceRepository.create({
            organisationUuid: parameters.organisationUuid,
            userUuid: parameters.userUuid,
        });

        return await this.paymentReferenceRepository.save(paymentReference);
    }
}
