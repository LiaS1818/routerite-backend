import {
	Injectable,
	NotFoundException,
	// ForbiddenException, // Remove unused import
	Logger,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import {
	PlaceDetailsMetadataParam,
	PlaceSearchMetadataParam,
} from '../../../../.api/apis/fsq-developers-places';
import type * as types from '../../../../.api/apis/fsq-developers-places/types';
import { FSQRPlace } from '../../interfaces/FSQRPlace.interface';


type FilterParams = {
	/** ids de categorias de Foursquare; acepta string o number */
	categoryIds?: Array<string | number>;
	/** rating minimo (0-10 Foursquare) */
	minRating?: number;
	/** solo lugares abiertos ahora */
	openNow?: boolean;
	/** ordenar por rating desc */
	sortByRatingDesc?: boolean;
};

interface FetchResponse<T, U> {
	status: T;
	data: U;
}

@Injectable()
export class FoursquareMockService {
	private readonly logger = new Logger(FoursquareMockService.name);

	constructor() {}

	private places: any[] = [];

	private loadPlacesJSON() {
		const fileContent= fs.readFileSync('assets/places.json', 'utf-8')
		const parsed = JSON.parse(fileContent);
		this.places = parsed.results.map((place: any) => {
			return {
				fsq_place_id: "mock-place-id",
				...place
			}
		})
		this.logger.log("Places loaded")
	}

	auth(token): void {
		this.loadPlacesJSON();
	}

	async placeSearch(
		params: PlaceSearchMetadataParam
	): Promise<FetchResponse<200, types.PlaceSearchResponse200>> {
		if (!this.places.length)
			throw new NotFoundException('Missing auth token, call auth first');

		let { limit = 10, query } = params;

		const places: FSQRPlace[] = [];
		const indexes: number[] = [];

		if(query) {
			const place = this.places.find(place => place.name.toLowerCase().includes(query.toLowerCase()));
			if(place) {
				places.push(place)
				indexes.push(this.places.indexOf(place))
				limit -= 1;
			}
		}

		// Generate n - non repeating random indexes
		while (indexes.length < limit) {
			const randomIndex = Math.floor(Math.random() * this.places.length);
			if (!indexes.includes(randomIndex)) {
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
								latitude: 20.6741723190878,
								longitude: -103.3481057748364,
							},
							radius: 12000,
						},
					},
				},
			},
			status: 200,
		};
	}

	async placeDetails(params: PlaceDetailsMetadataParam): Promise<FetchResponse<200, types.PlaceDetailsResponse200>> {
		if(!this.places.length) throw new NotFoundException("Missing auth token, call auth first")

		let { fsq_place_id } = params;
		if(!fsq_place_id) throw new NotFoundException("Missing fsq_place_id")

		const place = this.places.find(place => place.fsq_place_id === fsq_place_id);
		if(!place) throw new NotFoundException("Place not found")

		return {
			data: place,
			status: 200
		}
	}

	async getRandomPlace(): Promise<FSQRPlace> {
		if(!this.places.length) throw new NotFoundException("Missing auth token, call auth first")
		const placesWithHours = this.places.filter(place => place.hours && place.hours.regular && place.hours.regular.length > 0);
		return placesWithHours[Math.floor(Math.random() * placesWithHours.length)];
		// return this.places[Math.floor(Math.random() * this.places.length)];
	}



	
}

