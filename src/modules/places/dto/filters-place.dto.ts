import {
	IsEnum,
	IsInt,
	IsNumberString,
	IsOptional,
	IsString,
	Matches,
} from 'class-validator';
import { SortEnum } from '../enums/sort.enums';

export class SearchPlacesDto {

	@IsNumberString()
	tripId:number;

	@IsNumberString()
	itineraryId: number;

	/** Ej: "20.6736,-103.344" */
	@IsOptional() @Matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
	ll?: string;

	/** metros */
	@IsOptional() @IsNumberString()
	radius?: string;

	/** Ej: "20.70,-103.30" (lat,lng) */
	@IsOptional() @Matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
	ne?: string;

	/** Ej: "20.65,-103.40" (lat,lng) */
	@IsOptional() @Matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
	sw?: string;

	/** Ignorado en mock (geocoding externo) */
	@IsOptional() @IsString()
	near?: string;

	@IsOptional() @IsString()
	query?: string;

	/** CSV: ids o nombres de categoría */
	@IsOptional() @IsString()
	categories?: string;

	@IsOptional() @IsEnum(SortEnum)
	sort?: SortEnum;

	/** epoch (s|ms) o ISO8601 */
	@IsOptional() @IsString()
	open_at?: string;

	/** Para devolver menos campos si quieres (no filtra) */
	@IsOptional() @IsString()
	fields?: string;

	/** Límite simple (opcional) */
	@IsOptional() @IsNumberString()
	limit?: string;
}
