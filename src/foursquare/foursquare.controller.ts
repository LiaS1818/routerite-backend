// src/foursquare/foursquare.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { FoursquarePlacesService } from '../common/services/foursquare/foursquare-places.service';

@Controller('foursquare')
export class FoursquareController {
	constructor(private readonly foursquareService: FoursquarePlacesService) {}

	@Get('/autocomplete')
	async autocomplete(
		@Query('query') query: string,
		@Query('near') near?: string,
		@Query('ll') ll?: string
	) {
		return this.foursquareService.getAutocomplete(query, near, ll);
	}

	@Get('/search')
	async search(
		@Query('query') query: string,
		@Query('near') near?: string,
		@Query('ll') ll?: string,
		@Query('limit') limit?: number
	) {
		return this.foursquareService.searchPlacesNear(query, near, ll, limit);
	}
}
