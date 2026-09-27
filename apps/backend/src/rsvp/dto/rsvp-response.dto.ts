import { ApiProperty } from '@nestjs/swagger';
import { RsvpStatus } from '@prisma/client';

export class RsvpUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

export class RsvpResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  eventId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: RsvpStatus })
  status!: RsvpStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: RsvpUserDto })
  user!: RsvpUserDto;
}

export class PaginatedAttendeesResponseDto {
  @ApiProperty({ type: [RsvpResponseDto] })
  data!: RsvpResponseDto[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}
