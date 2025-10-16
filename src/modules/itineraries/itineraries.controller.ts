import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	ParseIntPipe,
	UseGuards,
	Request,
	Patch,
	Inject,
} from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { FoursquareMockService } from '../../common/services/foursquare/foursquare-mock.service';
import { ActivityService } from '../activity/activity.service';

@Controller('itineraries')
@UseGuards(JwtAuthGuard)
export class ItinerariesController {
	constructor(
		private readonly itinerariesService: ItinerariesService,
		private fsqDevelopersPlaces: FoursquareMockService
	) {}

	@Post()
	async create(
		@Body() createItineraryDto: CreateItineraryDto,
		@Request() req
	) {
		return this.itinerariesService.createItinerary(
			createItineraryDto,
			req.user.id
		);
	}

	// Get all itineraries and activities of a trip
	@Get('/all')
	async findAll(
		@Query('tripId', ParseIntPipe) tripId: number,
		@Request() req
	) {
		return this.itinerariesService.getItinerariesByTripId(
			tripId,
			req.user.id
		);
	}

	// To get a specific itinerary by ID
	@Get(':id')
	async getItinerary(@Param('id', ParseIntPipe) id: number, @Request() req) {
		try {
			const itinerary =
				await this.itinerariesService.getItineraryWithActivities(
					id,
					req.user.id
				);
			return itinerary;
		} catch (error) {
			return { statusCode: 404, message: 'Itinerary not found' };
		}
	}

	// To get itinerary by st

	@Get(':id/place')
	async getMockPlaceForTesting() {
		this.fsqDevelopersPlaces.auth("token")
		return this.fsqDevelopersPlaces.getRandomPlace()
	}

	//delete itinerary
	@Delete(':id')
	async deleteItinerary(@Param('id', ParseIntPipe) id: number) {
		return this.itinerariesService.remove(id);
	}

	@Patch(':id')
	async updateItinerary(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateItineraryDto: UpdateItineraryDto,
		@Request() req
	) {
		return this.itinerariesService.updateItinerary(
			id,
			updateItineraryDto,
		);
	}
	

}
