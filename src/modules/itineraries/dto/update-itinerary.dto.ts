import { Type } from 'class-transformer';
import {
	IsString,
	IsEmail,
	IsOptional,
	IsBoolean,
	MinLength,
	MaxLength,
	IsNotEmpty,
	isDate,
} from 'class-validator';
import { IsDate } from 'sequelize-typescript';

export class UpdateItineraryDto {
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

}
