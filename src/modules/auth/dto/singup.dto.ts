import {
	IsString,
	IsEmail,
	IsOptional,
	MinLength,
	MaxLength,
} from 'class-validator';

export class SignupDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	name: string;

	@IsOptional()
	@IsEmail()
	@MaxLength(255)
	email: string;

	@IsOptional()
	@IsString()
	@MinLength(6)
	@MaxLength(255)
	password: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	country?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	city?: string;
}

export class LoginDto {
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(6)
	password: string;
}
