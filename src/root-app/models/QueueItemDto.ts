import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

export class QueueItemDto {
    @ApiProperty()
    id!: string;
    @ApiProperty()
    queueDateLocal!: Date;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @ApiProperty()
    result!: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @ApiProperty()
    data!: string;
    @ApiPropertyOptional()
    failReason?: string;
}
