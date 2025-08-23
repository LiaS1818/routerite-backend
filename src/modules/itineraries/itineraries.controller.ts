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
import { json } from 'stream/consumers';

@Controller('/itineraries')
export class ItinerariesController {
    constructor(private readonly itinerariesService: ItinerariesService) {}

    @Post()
    create(@Body() createItineraryDto: CreateItineraryDto, @Request() req) {
        console.log("Place:", req.body.start_location);
        return this.itinerariesService.create(createItineraryDto);
    }

    // @Get()
	// async findAll(@Query('tripId', ParseIntPipe) tripId: number) {
  	// 	return this.itinerariesService.findAll(tripId);
	// }

	@Get()
	async getItinerary(@Query('tripId', ParseIntPipe) id: number) {
    try {
      const itinerary = await this.itinerariesService.getItineraryWithActivities(id);
      return itinerary;
    } catch (error) {
      return { statusCode: 404, message: 'Itinerary not found' };
    }
  }
}
