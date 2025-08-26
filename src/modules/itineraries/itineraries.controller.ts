import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	ParseIntPipe,
} from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';

@Controller('/itineraries')
export class ItinerariesController {
	constructor(private readonly itinerariesService: ItinerariesService) {}

	@Post()
	async create(@Body() createItineraryDto: CreateItineraryDto) {
		return this.itinerariesService.createItinerary(createItineraryDto);
	}

	// Get all itineraries and activities of a trip
	@Get('/all')
	async findAll(@Query('tripId', ParseIntPipe) tripId: number) {
		return this.itinerariesService.getItinerariesByTripId(tripId);
	}

	// To get a specific itinerary by ID
	@Get(':id')
	async getItinerary(@Param('id', ParseIntPipe) id: number) {
		try {
			const itinerary =
				await this.itinerariesService.getItineraryWithActivities(id);
			return itinerary;
		} catch (error) {
			return { statusCode: 404, message: 'Itinerary not found' };
		}
	}
}
