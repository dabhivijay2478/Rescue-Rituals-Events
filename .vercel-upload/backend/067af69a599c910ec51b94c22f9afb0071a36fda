import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventCreatorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

export class EventResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty()
  startTime!: Date;

  @ApiProperty()
  endTime!: Date;

  @ApiPropertyOptional({ nullable: true })
  capacity!: number | null;

  @ApiProperty()
  goingCount!: number;

  @ApiProperty()
  createdById!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: EventCreatorDto })
  createdBy?: EventCreatorDto;
}

export class PaginatedEventsResponseDto {
  @ApiProperty({ type: [EventResponseDto] })
  data!: EventResponseDto[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}
