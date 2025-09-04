import { Type } from 'class-transformer';
import {
	IsString,
	IsOptional,
	MaxLength,
	IsNotEmpty,
	IsNumber,
	IsDateString,
	IsArray,
	ValidateNested,
} from 'class-validator';
import { ExperienceTypeDto } from './experience_type.dto';

export class UpdateItineraryDto {
	@IsOptional()
	@IsString()
	start_time?: string;

	@IsOptional()
	@IsString()
	end_time?: string;

	@IsOptional()
	@IsNumber()
	budget?: number;

	@IsOptional()
	@IsNumber()
	lat?: number;

	@IsOptional()
	@IsNumber()
	lng?: number;

	@IsOptional()
	@IsArray()
	@Type(() => String)
	experience_type_ids?: string[];
}
