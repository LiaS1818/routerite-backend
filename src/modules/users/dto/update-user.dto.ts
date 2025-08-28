import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsString()
	name: string;

	@IsString()
	email: string;

	@IsOptional()
	@IsString()
	password?: string;
}
