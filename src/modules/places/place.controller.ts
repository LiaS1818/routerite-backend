import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { PlaceService } from './place.service';

@Controller('places')
export class PlaceController {
	private readonly logger = new Logger(PlaceController.name);

	constructor(private readonly placeService: PlaceService) {}

	@Get(':fsqId')
	async getPlaceByFsqId(@Param('fsqId') fsqId: string) {
		return this.placeService.findByFsqId(fsqId);
	}

	@Post()
	async createPlace(@Body() placeData: any) {
		return this.placeService.findOrCreatePlace(placeData);
	}
}
