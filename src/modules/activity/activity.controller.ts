import {
	Controller,
	Get,
	Post,
	Body,
	ParseIntPipe,
	Query,
	BadRequestException,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity } from 'src/database/models';
import { FoursquarePlacesService } from '../../common/services/foursquare/foursquare-place.service';

@Controller('activities')
export class ActivityController {
	constructor(
		private readonly activityService: ActivityService,
		private readonly foursquarePlacesService: FoursquarePlacesService
	) {}

	@Post()
	async create(
		@Body() createActivityDto: CreateActivityDto
	): Promise<Activity> {
		console.log(
			'Intentando crear actividad con itinerary_id:',
			createActivityDto.itinerary_id
		);

		try {
			return await this.activityService.create(createActivityDto);
		} catch (error) {
			console.error('Error al crear actividad:', error);
			throw new BadRequestException('No se pudo crear la actividad');
		}
	}

	@Get()
	async getPlacesByItineraryParams(
		@Query('itinerary_id', ParseIntPipe) itinerary_id: number
	): Promise<any> {
		console.log(
			'Intentando obtener actividades por itinerario_id:',
			itinerary_id
		);
		return this.foursquarePlacesService.searchPlaces({
			ll: '40.748817,-73.985428', // Example: Latitude and Longitude of the Empire State Building
			query: '',
			radius: 1000,
		});
	}
}
