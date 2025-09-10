import {
	IsInt,
	IsString,
	IsNumber,
	IsNotEmpty,
	IsObject,
	IsMilitaryTime,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { FSQRPlace } from '../../../common/interfaces/FSQRPlace.interface';

export class CreateActivityDto {
	@IsNotEmpty({ message: 'Name is required' })
	@IsString({ message: 'Name must be a string' })
	@Transform(({ value }) => value?.trim())
	name: string;

	@IsNotEmpty({ message: 'Description is required' })
	@IsString({ message: 'Description must be a string' })
	@Transform(({ value }) => value?.trim())
	description: string;

	@IsNotEmpty({ message: 'Time is required' })
	@IsMilitaryTime({ message: 'Start time must be in HH:MM format' })
	start_time: string;

	@IsNotEmpty({ message: 'Time is required' })
	@IsMilitaryTime({ message: 'Start time must be in HH:MM format' })
	end_time: string;

	@IsNotEmpty({ message: 'Budget is required' })
	@IsNumber({}, { message: 'Budget must be a number' })
	budget: number;

	@IsNotEmpty({ message: 'Itinerary ID is required' })
	@IsInt({ message: 'Itinerary ID must be an integer' })
	itinerary_id: number;

	@IsNotEmpty({ message: 'Location is required' })
	@IsObject({ message: 'Location must be an object' })
	place: FSQRPlace;
}
