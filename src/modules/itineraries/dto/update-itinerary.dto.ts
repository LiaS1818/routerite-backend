import { Type } from 'class-transformer';
import {
	IsString,
	IsOptional,
	MaxLength,
	IsNotEmpty,
	IsNumber,
	IsDateString,
} from 'class-validator';

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
	@IsString()
	experience_type_ids?: string;

	@IsOptional()
	@IsString()
	experience_types?: string;

	@IsOptional()
	@Type(() => Date)
	date?: Date;

}
