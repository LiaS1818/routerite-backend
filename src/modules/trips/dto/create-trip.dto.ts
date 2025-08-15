// filepath: /home/cardonapablo/Documentos/Proyectos/RouteRite/routerite-backend/src/modules/trips/dto/create-trip.dto.ts
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
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTripDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	destination: string;

	@IsDateString()
	@IsNotEmpty()
	@Transform(({ value }) => new Date(value))
	start_date: Date;

	@IsDateString()
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
