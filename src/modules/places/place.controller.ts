
import {
	Controller,
	Get,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { ConfigService } from '@nestjs/config';
import { SearchPlacesDto } from './dto/filters-place.dto';
import { Logger } from '@nestjs/common';

@Controller('places')
export class PlaceController {
	private readonly logger = new Logger(PlaceController.name);

	constructor(
		private readonly svc: PlacesService,
		private readonly configService: ConfigService
	) {}


	@Get('search')
	@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
	async search(@Query() q: SearchPlacesDto): Promise<any> {
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

		console.log('Clean Params:', cleanParams);
		const result = await this.svc.search(cleanParams as Partial<SearchPlacesDto>);
		console.log('Search Result:', result);
		return result;

	}
}
