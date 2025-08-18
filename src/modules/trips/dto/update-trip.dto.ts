// filepath: /home/cardonapablo/Documentos/Proyectos/RouteRite/routerite-backend/src/modules/trips/dto/update-trip.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTripDto } from './create-trip.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateTripDto extends PartialType(CreateTripDto) {
  @IsOptional()
  @IsEnum(['draft', 'planned', 'active', 'completed', 'cancelled'])
  status?: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
}
