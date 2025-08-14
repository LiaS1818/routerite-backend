import {
	IsOptional,
	IsDateString,
	IsString,
	IsNumber,
	IsEnum,
	Min,
	Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ViajeFiltersDto {
	@IsOptional()
	@IsDateString()
	fechaInicio?: string;

	@IsOptional()
	@IsDateString()
	fechaFin?: string;

	@IsOptional()
	@IsEnum(['cultura', 'aventura', 'gastronomia', 'playa', 'naturaleza'])
	tipoExperiencia?: 'cultura' | 'aventura' | 'gastronomia' | 'playa' | 'naturaleza';

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Transform(({ value }) => parseFloat(value))
	presupuestoMin?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Transform(({ value }) => parseFloat(value))
	presupuestoMax?: number;

	@IsOptional()
	@IsEnum(['draft', 'planned', 'active', 'completed', 'cancelled'])
	status?: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';

	@IsOptional()
	@IsString()
	destino?: string;

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(100)
	@Transform(({ value }) => parseInt(value))
	limit?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Transform(({ value }) => parseInt(value))
	offset?: number;

	@IsOptional()
	@IsString()
	orderBy?: string;

	@IsOptional()
	@IsEnum(['ASC', 'DESC'])
	orderDirection?: 'ASC' | 'DESC';
}