// src/modules/activities/dto/update-activity.dto.ts
import {
  IsInt,
  IsString,
  IsNumber,
  IsObject,
  IsMilitaryTime,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { FSQRPlace } from '../../../common/interfaces/FSQRPlace.interface';

export class UpdateActivityDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsMilitaryTime({ message: 'start_time must be in HH:MM format' })
  start_time?: string;

  @IsOptional()
  @IsMilitaryTime({ message: 'end_time must be in HH:MM format' })
  end_time?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Budget must be a number' })
  budget?: number;

  // NO exponemos itinerary_id (no se puede mover de itinerario desde update)

  @IsOptional()
  @IsObject({ message: 'Location must be an object' })
  place?: FSQRPlace;
}
