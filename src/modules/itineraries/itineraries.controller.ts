import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Request,
	Query,
	ParseIntPipe,
	HttpException,
	HttpStatus,
	BadRequestException,
} from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { json } from 'stream/consumers';

@Controller('/itineraries')
export class ItinerariesController {
    constructor(private readonly itinerariesService: ItinerariesService) {}

	@Post()
	async create(@Body() createItineraryDto: CreateItineraryDto) {
		return this.itinerariesService.createItinerary(createItineraryDto);
	}

    // @Patch(':id')
    // async update(@Param('id', ParseIntPipe) id: number, @Body() updateItineraryDto: UpdateItineraryDto) {
    //     return this.itinerariesService.updateItinerary(id, updateItineraryDto);
    // }

	// Get all itineraries and activities of a trip
    @Get('/all')
	async findAll(@Query('tripId', ParseIntPipe) tripId: number) {
  		return this.itinerariesService.getItinerariesByTripId(tripId);
	}

	// To get a specific itinerary by ID
	@Get(':id')
	async getItinerary(@Param('id', ParseIntPipe) id: number) {
    try {
      const itinerary = await this.itinerariesService.getItineraryWithActivities(id);
      return itinerary;
    } catch (error) {
      return { statusCode: 404, message: 'Itinerary not found' };
    }
  }
}
