import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum EventWhenFilter {
  UPCOMING = 'upcoming',
  PAST = 'past',
  ALL = 'all',
}

export class ListEventsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: EventWhenFilter, default: EventWhenFilter.UPCOMING })
  @IsOptional()
  @IsEnum(EventWhenFilter)
  when?: EventWhenFilter = EventWhenFilter.UPCOMING;
}
