import { IsNotEmpty, IsString } from 'class-validator';

export class ReplacePlaceDto {
	@IsNotEmpty({ message: 'Foursquare place ID is required' })
	@IsString({ message: 'Foursquare place ID must be a string' })
	fsq_place_id: string;
}
