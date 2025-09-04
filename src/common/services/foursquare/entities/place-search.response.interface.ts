import { FoursquarePlaceInterface } from './foursquare-place.interface';

export interface FoursquareGeocodingContext {
	geo_bounds?: {
		circle?: {
			center?: { latitude: number; longitude: number };
			radius?: number;
		};
	};
}

export interface PlaceSearchResponseInterface {
	results: FoursquarePlaceInterface[];
	context?: FoursquareGeocodingContext;
}