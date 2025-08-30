import {
	Controller,
	Get,
	Post,
	Body,
	ParseIntPipe,
	Query,
	BadRequestException,
	UseGuards,
	Request,
	Param,
	Delete,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity } from 'src/database/models';
import { FoursquarePlacesService } from '../../common/services/foursquare/foursquare-place.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
	constructor(
		private readonly activityService: ActivityService,
		private readonly foursquarePlacesService: FoursquarePlacesService
	) {}

	@Post()
	async create(
		@Body() createActivityDto: CreateActivityDto,
		@Request() req
	): Promise<Activity> {
		console.log(
			'Intentando crear actividad con itinerary_id:',
			createActivityDto.itinerary_id
		);

		try {
			return await this.activityService.create(
				createActivityDto,
				req.user.id
			);
		} catch (error) {
			console.error('Error al crear actividad:', error);
			throw new BadRequestException('No se pudo crear la actividad');
		}
	}

	@Get()
	async getPlacesByItineraryParams(
		@Query('itinerary_id', ParseIntPipe) itinerary_id: number,
		@Request() req
	): Promise<any> {
		console.log(
			'Intentando obtener actividades por itinerario_id:',
			itinerary_id
		);

		// Validate access to itinerary first
		await this.activityService.findByItinerary(itinerary_id, req.user.id);

		return this.foursquarePlacesService.searchPlaces({
			ll: '40.748817,-73.985428', // Example: Latitude and Longitude of the Empire State Building
			query: '',
			radius: 1000,
		});
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
		return this.activityService.findOne(id, req.user.id);
	}

	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
		await this.activityService.remove(id, req.user.id);
		return { message: 'Activity deleted successfully' };
	}

	@Get('itinerary/:itineraryId')
	async findByItinerary(
		@Param('itineraryId', ParseIntPipe) itineraryId: number,
		@Request() req
	) {
		return this.activityService.findByItinerary(itineraryId, req.user.id);
	}
}
