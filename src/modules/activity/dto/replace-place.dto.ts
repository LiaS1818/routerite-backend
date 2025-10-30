import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { FSQRPlace } from '../../../common/interfaces/FSQRPlace.interface';

export class ReplacePlaceDto {

	@IsNotEmpty({ message: 'Location is required' })
	@IsObject({ message: 'Location must be an object' })
	place: FSQRPlace;

}
