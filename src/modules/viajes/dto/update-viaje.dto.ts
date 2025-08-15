import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateViajeDto } from './create-viaje.dto';

export class UpdateViajeDto extends PartialType(CreateViajeDto) {
	@IsOptional()
	@IsEnum(['draft', 'planned', 'active', 'completed', 'cancelled'])
	status?: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
}