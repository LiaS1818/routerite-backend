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
	IsBoolean,
} from 'class-validator';
import { ExperienceTypeDto } from './experience_type.dto';
import { LocationInterface } from '../../trips/trip.interfaces';

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

	@IsOptional()
	@IsBoolean()
	is_configured?: boolean;

	@IsOptional()
	@ValidateNested()
	@Type(() => Object)
	starting_location?: LocationInterface;
}
