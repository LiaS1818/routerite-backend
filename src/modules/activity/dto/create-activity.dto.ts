import {
	IsInt,
	IsString,
	IsNumber,
	IsOptional,
	IsDateString,
	IsIn,
	IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateActivityDto {
	@IsOptional()
	@IsInt({ message: 'Day must be an integer' })
	day?: number;

	@IsNotEmpty({ message: 'Description is required' })
	@IsString({ message: 'Description must be a string' })
	@Transform(({ value }) => value?.trim())
	description: string;

	@IsNotEmpty({ message: 'Time is required' })
	@IsDateString({}, { message: 'Time must be a valid date string' })
	time: Date;

	@IsNotEmpty({ message: 'Location is required' })
	@IsString({ message: 'Location must be a string' })
	@Transform(({ value }) => value?.trim())
	location: string;

	@IsNotEmpty({ message: 'Presupuesto is required' })
	@IsNumber({}, { message: 'Presupuesto must be a number' })
	budget: number;

	@IsNotEmpty({ message: 'Transportation mode is required' })
	@IsString({ message: 'Transportation mode must be a string' })
	@IsIn(['walking', 'car', 'bus', 'train', 'plane', 'bicycle'], {
		message:
			'Transportation mode must be one of: walking, car, bus, train, plane, bicycle',
	})
	transportation_mode: string;

	@IsOptional()
	@IsString({ message: 'Image URL must be a string' })
	@Transform(({ value }) => value?.trim())
	img_url?: string;

	@IsNotEmpty({ message: 'Itinerary ID is required' })
	@IsInt({ message: 'Itinerary ID must be an integer' })
	itinerary_id: number;
}
