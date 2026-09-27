import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Launch Night' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: 'Celebrate the product launch' })
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @MinLength(1)
  location!: string;

  @ApiProperty({ example: '2026-10-01T18:00:00.000Z' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2026-10-01T21:00:00.000Z' })
  @IsDateString()
  endTime!: string;

  @ApiPropertyOptional({ example: 50, description: 'Omit for unlimited' })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
