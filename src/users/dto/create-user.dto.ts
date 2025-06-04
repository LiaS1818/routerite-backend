import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@MinLength(2, { message: 'Name must have at least 2 characters' })
	readonly name: string;

	@IsEmail({}, { message: 'Please provide a valid email' })
	readonly email: string;

	@IsString()
	@MinLength(6, { message: 'Password must have at least 6 characters' })
	readonly password: string;

	@IsOptional()
	@IsBoolean()
	readonly isActive?: boolean;
}
