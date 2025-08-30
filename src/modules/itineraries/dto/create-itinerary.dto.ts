import { Type } from 'class-transformer';
import {
	IsString,
	IsOptional,
	MaxLength,
	IsNotEmpty,
	IsNumber,
	IsDateString,
} from 'class-validator';

export class CreateItineraryDto {
	@IsString()
	start_time: string;

	@IsString()
	end_time: string;

	@IsNotEmpty()
	@IsNumber()
	lat: number;

	@IsNotEmpty()
	@IsNumber()
	lng: number;

	@IsNotEmpty()
	@IsNumber()
	budget: number;

	@IsString()
	experience_type_ids: string;

	@IsString()
	experience_types: string;

	@IsNotEmpty()
	@Type(() => Date)
	date: Date;

	@IsNotEmpty()
	trip_id: number;
}
