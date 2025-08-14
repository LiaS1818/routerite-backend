import {
	IsString,
	IsEmail,
	IsOptional,
	MinLength,
	MaxLength,
} from 'class-validator';

export class SignupDto {
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	nombre: string;

	@IsEmail()
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
}

export class LoginDto {
	@IsEmail()
	correo: string;

	@IsString()
	@MinLength(6)
	contrasena: string;
}
