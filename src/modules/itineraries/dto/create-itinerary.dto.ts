import { Type } from 'class-transformer';
import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateItineraryDto {
	@IsString()
	start_time: string;

	@MaxLength(255)
	end_time: string;

	@IsOptional()
	budget: number;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	start_location: string;

	@IsOptional()
	@IsString()
	experience_type: string;

	@IsOptional()
	@Type(() => Date)
	date: Date;

	@IsNotEmpty()
	trip_id: number;
}
