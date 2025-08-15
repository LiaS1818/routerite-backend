import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsOptional()
	@IsString()
	@MinLength(6)
	@MaxLength(255)
	nueva_contrasena?: string;

	@IsOptional()
	@IsString()
	contrasena_actual?: string;
}
