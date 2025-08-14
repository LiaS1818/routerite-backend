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

export class CreateViajeDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	destino: string;

	@IsDateString()
	@IsNotEmpty()
	@Transform(({ value }) => new Date(value))
	fecha_inicio: Date;

	@IsDateString()
	@IsNotEmpty()
	@Transform(({ value }) => new Date(value))
	fecha_fin: Date;

	@IsNumber()
	@Min(1)
	@Max(20)
	@Transform(({ value }) => parseInt(value))
	n_viajeros: number;

	@IsNumber()
	@Min(0)
	@Transform(({ value }) => parseFloat(value))
	presupuesto_total: number;

	@IsEnum(['cultura', 'aventura', 'gastronomia', 'playa', 'naturaleza'])
	@IsNotEmpty()
	tipo_experiencia: 'cultura' | 'aventura' | 'gastronomia' | 'playa' | 'naturaleza';

	@IsBoolean()
	@Transform(({ value }) => value === 'true' || value === true)
	acompanamiento: boolean;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	portada?: string;

	@IsOptional()
	@IsString()
	notas?: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	ubicacion_inicio?: string;
}