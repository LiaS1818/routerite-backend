// DTO create Itinerary

import {
    IsString,
    IsEmail,
    IsOptional,
    IsBoolean,
    MinLength,
    MaxLength,
} from 'class-validator';

export class CreateItineraryDto {
    @IsString()
    start_time: string;

    @MaxLength(255)
    end_time: string;

    @IsOptional()
    budget: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    start_location: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    experience_type: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    date: Date;

}