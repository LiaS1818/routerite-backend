import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
	@IsString()
	token: string;

	@IsString()
	@MinLength(6)
	@MaxLength(255)
	new_password: string;
}
