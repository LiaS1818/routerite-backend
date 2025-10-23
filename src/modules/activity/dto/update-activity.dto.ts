// src/modules/activities/dto/update-activity.dto.ts
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  IsMilitaryTime,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FSQRPlace } from '../../../common/interfaces/FSQRPlace.interface';

export class UpdateActivityDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsMilitaryTime({ message: 'start_time must be HH:MM' })
  start_time?: string;

  @IsOptional() @IsMilitaryTime({ message: 'end_time must be HH:MM' })
  end_time?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  budget?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  lat?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  lng?: number;

  @IsOptional() @IsObject()
  place?: FSQRPlace;

  @IsOptional() @IsString()
  transportation_mode?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  sequence?: number | null;

  @IsOptional() @Type(() => Number) @IsInt()
  transportation_duration?: number | null;

  @IsOptional() @IsString()
  notes?: string | null;

  @IsOptional() @IsUrl()
  img_url?: string | null;

  // Intencionalmente NO exponemos itinerary_id para evitar mover la actividad.
}
