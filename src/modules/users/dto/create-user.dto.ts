import {
	IsString,
	IsEmail,
	IsOptional,
	IsBoolean,
	MinLength,
	MaxLength,
} from 'class-validator';

export class CreateUserDto {
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	nombre: string;

	//@IsEmail()
	@MaxLength(255)
	correo: string;

	@IsString()
	@MinLength(6)
	@MaxLength(255)
	contrasena: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	pais?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	ciudad?: string;

	@IsOptional()
	@IsBoolean()
	verificado?: boolean;

	@IsOptional()
	@IsBoolean()
	activo?: boolean;
}
