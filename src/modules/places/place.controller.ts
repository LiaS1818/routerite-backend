
import { 
	Controller,
	Get,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { FoursquareMockService } from 'src/common/services/foursquare/foursquare-mock.service';
import { ConfigService } from '@nestjs/config';
import { SearchPlacesDto } from './dto/filters-place.dto';

import { Logger } from '@nestjs/common';
import { Response } from 'express';

@Controller('places')
export class PlaceController {
	private readonly logger = new Logger(PlaceController.name);

	constructor(
		
		private readonly svc: PlacesService,
		private readonly foursquareService: FoursquareMockService,
		private readonly configService: ConfigService
	) {}


	@Get('search')
	@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
	async search(@Query() q: SearchPlacesDto): Promise<any> {
	// Emula el endpoint /v3/places/search aceptando mismos nombres de query params
	return this.svc.search(q);
	}

	
}
