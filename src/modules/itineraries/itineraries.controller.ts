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
} from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';

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

	//update itinerary. receiving itinerary id in body json
	@Put(':id')
	async updateItinerary(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateItineraryDto: UpdateItineraryDto
	) {
		return this.itinerariesService.updateItinerary(id, updateItineraryDto);
	}

	//delete itinerary
	@Delete(':id')
	async deleteItinerary(@Param('id', ParseIntPipe) id: number) {
		return this.itinerariesService.remove(id);
	}
}
