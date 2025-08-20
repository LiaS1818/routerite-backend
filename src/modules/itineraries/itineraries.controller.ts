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

@Controller('/itineraries')
export class ItinerariesController {
    constructor(private readonly itinerariesService: ItinerariesService) {}

    @Post()
    create(@Body() createItineraryDto: CreateItineraryDto, @Request() req) {
        console.log("Place:", req.body.start_location);
        return this.itinerariesService.create(createItineraryDto);
    }

    @Get()
    findAll(@Query('userId', ParseIntPipe) userId: number) {
        return this.itinerariesService.findAll(userId);
    }

}
