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
	name: string;

	@IsEmail()
	@MaxLength(255)
	email: string;

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

	@IsOptional()
	@IsBoolean()
	verified?: boolean;

	@IsOptional()
	@IsBoolean()
	active?: boolean;
}
