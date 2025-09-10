import {
	Controller,
	Get,
	Query,
	Param,
	Post,
	Body,
	Res,
	ParseIntPipe,
	ValidationPipe,
	NotFoundException,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { FSQRPlace } from 'src/common/interfaces/FSQRPlace.interface';
import { FilterPlacesDto } from './dto/filters-place.dto';
import { FoursquareMockService } from 'src/common/services/foursquare/foursquare-mock.service';
import { ConfigService } from '@nestjs/config';

import { Logger } from '@nestjs/common';
import { Response } from 'express';

@Controller('places')
export class PlaceController {
	private readonly logger = new Logger(PlaceController.name);

	constructor(
		private readonly placeService: PlaceService,
		private readonly foursquareService: FoursquareMockService,
		private readonly configService: ConfigService
	) {}


	@Get('autocomplete')
	async autocomplete(@Query('q') query: string) {
		return this.foursquareService.autocomplete(query);
	}

	@Get('place-search-filtered')
	async placeSearchFiltered(@Query() query: any) {
		let categoryIds: string[] | undefined;

		if (typeof query.categoryIds === 'string') {
			try {
				if (query.categoryIds.trim().startsWith('[')) {
					// viene como string tipo '["id1","id2"]'
					categoryIds = JSON.parse(query.categoryIds);
				} else {
					// viene como "id1,id2,id3"
					categoryIds = query.categoryIds
						.split(',')
						.map((s: string) => s.trim());
				}
			} catch (e) {
				console.error('Error parsing categoryIds:', e);
				categoryIds = [];
			}
		} else if (Array.isArray(query.categoryIds)) {
			categoryIds = query.categoryIds.map((s: any) => String(s).trim());
		}

		// crea string separado por comas si lo necesitas
		const categoryIdsString = categoryIds?.join(',') ?? '';

		console.log('categoryIds:', categoryIds);
		console.log('categoryIdsString:', categoryIdsString);
		console.log('minRating:', query.minRating);
		console.log('name:', query.name);
		


		const resp = await this.foursquareService.placeSearchFiltered({
			...query,
			limit: query.limit ? Number(query.limit) : undefined,
			minRating: query.minRating ? Number(query.minRating) : undefined,
			name: query.name ? String(query.name) : undefined,
			categoryIds,
		});

		return resp.data.results;
	}

	
}
