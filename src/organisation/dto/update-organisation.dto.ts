import {PartialType} from "@nestjs/swagger";
import {CreateOrganisationDto} from "./create-organisation.dto.js";

export class UpdateOrganisationDto extends PartialType(CreateOrganisationDto) {}
