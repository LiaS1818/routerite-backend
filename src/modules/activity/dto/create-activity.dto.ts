import {
	IsInt,
	IsString,
	IsNumber,
	IsOptional,
	IsDateString,
	IsIn,
	IsNotEmpty,
	IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
	@IsDateString({}, { message: 'Time must be a valid date string' })
	time: Date;

	@IsNotEmpty({ message: 'Latitude is required' })
	@IsString({ message: 'Latitude must be a string' })
	lat: string;

	@IsNotEmpty({ message: 'Longitude is required' })
	@IsString({ message: 'Longitude must be a string' })
	lng: string;

	@IsNotEmpty({ message: 'Category name is required' })
	@IsString({ message: 'Category name must be a string' })
	@Transform(({ value }) => value?.trim())
	category_name: string;

	@IsNotEmpty({ message: 'Category FSQR ID is required' })
	@IsString({ message: 'Category FSQR ID must be a string' })
	@Transform(({ value }) => value?.trim())
	category_fsqr_id: string;

	@IsNotEmpty({ message: 'Distance to start is required' })
	@IsNumber({}, { message: 'Distance to start must be a number' })
	distance_to_start: number;

	@IsNotEmpty({ message: 'Budget is required' })
	@IsNumber({}, { message: 'Budget must be a number' })
	budget: number;

	@IsNotEmpty({ message: 'Price is required' })
	@IsNumber({}, { message: 'Price must be a number' })
	price: number;

	@IsNotEmpty({ message: 'Location is required' })
	@IsObject({ message: 'Location must be an object' })
	location: any;

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
