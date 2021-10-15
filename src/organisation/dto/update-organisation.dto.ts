import {PartialType} from "@nestjs/swagger";
import {CreateOrganisationDto} from "./create-organisation.dto";

export class UpdateOrganisationDto extends PartialType(CreateOrganisationDto) {}
