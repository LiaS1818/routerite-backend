import { PartialType } from '@nestjs/mapped-types';
import { CreateTripDto } from './create-trip.dto';
import {
	IsEnum,
	IsOptional,
	IsDateString,
	IsNumber,
	Min,
	Max,
	IsString,
} from 'class-validator';

export class UpdateTripDto extends PartialType(CreateTripDto) {
  @IsEnum(['draft', 'planned', 'active', 'completed', 'cancelled'])
  status?: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
}

export class UpdateTripExtendedDto {
  @IsDateString()
  start_date?: string | Date;

  @IsDateString()
  end_date?: string | Date;

  @IsNumber()
  @Min(1)
  @Max(20)
  travelers_count?: number;

  @IsNumber()
  @Min(0)
  total_budget?: number;

  @IsOptional()
  @IsEnum(['draft', 'planned', 'active', 'completed', 'cancelled'])
  status?: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
}
