import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class ExperienceTypeDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;
}