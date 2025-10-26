
import {
	Controller,
	Get,
	Query,
	UsePipes,
	ValidationPipe,
	Request
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { ConfigService } from '@nestjs/config';
import { SearchPlacesDto } from './dto/filters-place.dto';
import { Logger } from '@nestjs/common';
import { TripsService } from '../trips/trips.service';
import { ItinerariesService } from '../itineraries/itineraries.service';
import { latLngStringToObject } from '../../shared/utils/location.utils';

@Controller('places')
export class PlaceController {
	private readonly logger = new Logger(PlaceController.name);

	constructor(
		private readonly svc: PlacesService,
		private readonly configService: ConfigService,
		private readonly tripsService: TripsService,
		private readonly itinerariesService: ItinerariesService,
	) {}


	@Get('search')
	@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
	async search(
		@Query() q: SearchPlacesDto,
		@Request() req: any
	): Promise<any> {
		// Emula el endpoint /v3/places/search aceptando mismos nombres de query params
		// Normaliza strings "null"/"undefined" y vacíos a `undefined`
		const normalized = Object.fromEntries(
			Object.entries(q).map(([k, v]) => {
			if (v === null || v === undefined) return [k, undefined];
			if (typeof v === 'string') {
				const trimmed = v.trim();
				if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
				return [k, undefined];
				}
				return [k, trimmed];
			}
			return [k, v];
			})
		);

		// Quita claves sin valor
		const cleanParams = Object.fromEntries(
			Object.entries(normalized).filter(([_, v]) => v !== undefined)
		);

		// Si te mandan open_at en formato "2025-10-21 14:56:00.000", intenta parsearlo a ISO
		if (typeof cleanParams.open_at === 'string' && cleanParams.open_at.includes(' ')) {
			const iso = new Date(cleanParams.open_at.replace(' ', 'T')).toISOString();
			cleanParams.open_at = iso;
		}

		// Obtener la longitud y latitud de:
		// 1. Si está configurado, itinerary.starting_location.latLng
		// 2. Trip.location.latLng

		let startingLocation;
		const itinerary = await this.itinerariesService.findOne(q.itineraryId)
		if(itinerary.starting_location) {
			startingLocation = latLngStringToObject( itinerary.starting_location.latLng )
		} else {
			const trip = await this.tripsService.findByIdWithAccess(q.tripId, req.user.id)
			// @ts-ignore
			startingLocation = latLngStringToObject(trip.location.latLng);
		}
		cleanParams.ll = `${startingLocation.lat},${startingLocation.lng}`;

		// @ts-ignore
		const result = await this.svc.search(cleanParams as Partial<SearchPlacesDto>);
		console.log('Search Result:', result);
		return result;

	}
}
