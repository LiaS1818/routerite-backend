import { IsNotEmpty, IsNumber, IsEmail } from 'class-validator';

export class CreateInvitationDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;
}
