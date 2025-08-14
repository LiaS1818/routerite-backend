import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
	@IsString()
	token: string;

	@IsString()
	@MinLength(6)
	@MaxLength(255)
	nueva_contrasena: string;
}
