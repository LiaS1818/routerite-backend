import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	Logger,
} from '@nestjs/common';
import { PlaceSearchMetadataParam } from '../../../../.api/apis/fsq-developers-places';
import type * as types from '../../../../.api/apis/fsq-developers-places/types';
import { FSQRPlace } from '../../interfaces/FSQRPlace.interface';
import * as fs from 'node:fs';

interface FetchResponse<T, U> {
	status: T;
	data: U;
}

@Injectable()
export class FoursquareMockService {
	private readonly logger = new Logger(FoursquareMockService.name);

	constructor() {
	}

	private places: any[] = [];

	private loadPlacesJSON() {
		const fileContent= fs.readFileSync('assets/places_mock.json', 'utf-8')
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

		if(!this.places.length) throw new NotFoundException("Missing auth token, call auth first")

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
