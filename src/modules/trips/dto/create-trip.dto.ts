import {
	IsString,
	IsNotEmpty,
	IsDateString,
	IsNumber,
	IsEnum,
	IsBoolean,
	IsOptional,
	Min,
	Max,
	MaxLength,
	ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LocationInterface } from '../trip.interfaces';
import { Optional } from '@nestjs/common';

export class LocationDto implements LocationInterface {
	@IsString()
	@IsNotEmpty()
	latLng: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	address: string;

	@IsString()
	@IsNotEmpty()
	city: string;

	@IsString()
	@IsNotEmpty()
	state: string;

	@IsString()
	@IsNotEmpty()
	country: string;

	@IsString()
	@Optional()
	zipCode: string;
}

export class CreateTripDto {
	@ValidateNested()
	@Type(() => LocationDto)
	@IsOptional()
	location: LocationInterface;

	@IsNotEmpty()
	@Transform(({ value }) => new Date(value))
	start_date: Date;

	@IsNotEmpty()
	@Transform(({ value }) => new Date(value))
	end_date: Date;

	@IsNumber()
	@Min(1)
	@Max(20)
	@Transform(({ value }) => parseInt(value))
	travelers_count: number;

	@IsNumber()
	@Min(0)
	@Transform(({ value }) => parseFloat(value))
	total_budget: number;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	cover_image?: string;
}
