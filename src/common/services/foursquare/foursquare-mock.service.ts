import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	Logger,
} from '@nestjs/common';
import { PlaceSearchMetadataParam } from '../../../../.api/apis/fsq-developers-places';
import type * as types from '../../../../.api/apis/fsq-developers-places/types';
import { FSQRPlace } from '../../interfaces/FSQRPlace.interface';

interface FetchResponse<T, U> {
	status: T;
	data: U;
}

@Injectable()
export class FoursquareMockService {
	private readonly logger = new Logger(FoursquareMockService.name);

	constructor() {
		this.loadPlacesJSON();
	}

	private places: any[] = [];

	private loadPlacesJSON() {
		const places = require('../../../../assets/places_mock.json');
		this.places = places.results;
	}

	async placeSearch(
		params: PlaceSearchMetadataParam
	): Promise<FetchResponse<200, types.PlaceSearchResponse200>> {
		const { limit = 10 } = params;
		// Generate n - non repeating random indexes
		const indexes: number[] = [];
		const places: FSQRPlace[] = [];
		while(indexes.length < limit) {
			const randomIndex = Math.floor(Math.random() * this.places.length);
			if(!indexes.includes(randomIndex)) {
				indexes.push(randomIndex);
				places.push(this.places[randomIndex]);
			}
		}
		return {
			data: {
				// @ts-ignore
				results: places,
				context: {
					geo_bounds: {
						circle: {
							center: {
								"latitude": 20.6741723190878,
								"longitude": -103.3481057748364
							},
							radius: 12000
						}
					}
				}
			},
			status: 200
		}
	}
}
