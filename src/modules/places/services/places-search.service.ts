import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FoursquareMockService } from '../../../common/services/foursquare/foursquare-mock.service';
import { PlaceSearchParams } from '../dto/place-search.dto';
import { FSQRPlace } from '../../../common/interfaces/FSQRPlace.interface';
import fsqDevelopersPlaces from '@api/fsq-developers-places';

@Injectable()
export class PlacesSearchService {
	private readonly logger = new Logger(PlacesSearchService.name);
	private readonly useMock: boolean;
	private readonly defaultFields: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly fsqDevelopersPlaces: FoursquareMockService,
	) {
		// Determinar servicio a usar
		this.useMock = this.configService.get<boolean>('USE_FOURSQUARE_MOCK', true);

		// Lista completa de campos necesarios
		this.defaultFields = "fsq_place_id,name,description,distance,price,rating,tel,website,social_media,latitude,longitude,categories,hours,location,stats"

		this.logger.log(`Initialized with ${this.useMock ? 'MOCK' : 'REAL'} Foursquare service`);
	}

	/**
	 * Busca lugares en Foursquare basado en los parámetros especificados
	 */
	async searchPlaces(params: PlaceSearchParams, requestId?: string): Promise<FSQRPlace[]> {
		const logPrefix = requestId ? `[${requestId}]` : '';

		this.logger.log(`${logPrefix} Starting place search with params:`, {
			lat: params.lat,
			lng: params.lng,
			radius: params.radius,
			categories: params.categories,
			limit: params.limit,
			service: this.useMock ? 'MOCK' : 'REAL'
		});

		try {
			// Construir query parameters
			const queryParams = this.buildQueryParameters(params);

			// Ejecutar búsqueda según configuración
			let rawPlaces: FSQRPlace[] = await this.searchWithService(queryParams, requestId);

			// Validar respuesta
			this.validateResponse(rawPlaces, requestId);

			this.logger.log(`${logPrefix} Place search completed: ${rawPlaces.length} results obtained`);
			return rawPlaces;

		} catch (error) {
			this.logger.error(`${logPrefix} Place search failed: ${error.message}`, error.stack);

			// Manejo de errores específico
			throw new ServiceUnavailableException({
				success: false,
				message: 'Servicio de lugares temporalmente no disponible',
				error: {
					code: 'PLACES_SERVICE_ERROR',
					type: 'SERVICE_ERROR',
					details: error.message || 'Error desconocido en el servicio de lugares'
				},
				suggestions: [
					'Intenta nuevamente en unos momentos',
					'Verifica tu conexión a internet',
					'Si el problema persiste, contacta al soporte técnico'
				]
			});
		}
	}

	/**
	 * Construye los parámetros de query para la búsqueda
	 */
	private buildQueryParameters(params: PlaceSearchParams): any {
		return {
			// Coordenadas en formato requerido
			ll: `${params.lat},${params.lng}`,
			// Radio de búsqueda
			radius: params.radius,
			// Categorías como string separado por comas
			fsq_category_ids: params.categories.join(','),
			// Límite de resultados
			limit: params.limit,
			// Ordenamiento (configurable)
			sort: this.configService.get<string>('FOURSQUARE_SORT', 'RELEVANCE'),
			// Campos a incluir
			fields: this.defaultFields
		};
	}

	/**
	 * Ejecuta búsqueda usando el servicio mock
	 */
	private async searchWithService(queryParams: any, requestId?: string): Promise<FSQRPlace[]> {
		const logPrefix = requestId ? `[${requestId}]` : '';

		try {
			this.logger.log(`${logPrefix} Using Foursquare service`);

			// Asegurar autenticación del mock service
			const fsqrApiKey = this.configService.get<string>('FSQR_API_KEY') || " ";
			const useFSQRMock = this.configService.get('USE_FSQR_MOCK', true);
			const fsqrService =  useFSQRMock != "false"  ? this.fsqDevelopersPlaces : fsqDevelopersPlaces;

			fsqrService.auth(fsqrApiKey);
			const response = await fsqrService.placeSearch({
				...queryParams,
				'X-Places-Api-Version': '2025-06-17'
			});

			// Extraer lugares de la respuesta
			const places = response.data?.results || [];

			this.logger.log(`${logPrefix} service returned ${places.length} places`);
			// @ts-ignore
			return places;

		} catch (error) {
			this.logger.error(`${logPrefix} service error: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Valida que la respuesta sea válida
	 */
	private validateResponse(rawPlaces: any, requestId?: string): void {
		const logPrefix = requestId ? `[${requestId}]` : '';

		// Verificar que es un array
		if (!Array.isArray(rawPlaces)) {
			this.logger.error(`${logPrefix} Invalid response: not an array`);
			throw new Error('Respuesta inválida del servicio de lugares: no es un array');
		}

		// Si está vacío, solo loggear (no es error)
		if (rawPlaces.length === 0) {
			this.logger.warn(`${logPrefix} No places found matching search criteria`);
			return;
		}

		// Validar estructura básica de algunos lugares
		const invalidPlaces = rawPlaces.filter(place =>
			!place.fsq_place_id ||
			!place.name
		);

		if (invalidPlaces.length > 0) {
			this.logger.warn(`${logPrefix} Found ${invalidPlaces.length} places with invalid structure`);
		}

		this.logger.log(`${logPrefix} Response validation completed: ${rawPlaces.length} valid places`);
	}

	/**
	 * Obtiene información de configuración del servicio
	 */
	getServiceInfo(): any {
		return {
			service_type: this.useMock ? 'MOCK' : 'REAL',
			default_fields: this.defaultFields,
			configuration: {
				use_mock: this.useMock,
				sort_default: this.configService.get<string>('FOURSQUARE_SORT', 'RELEVANCE'),
				min_rating_default: this.configService.get<number>('MIN_PLACE_RATING', 6.0)
			}
		};
	}

	/**
	 * Verifica la salud del servicio de lugares
	 */
	async healthCheck(): Promise<boolean> {
		try {
			if (this.useMock) {
				// Para mock, verificar que podemos hacer auth
				return true;
			} else {
				// TODO: Implementar health check para servicio real
				// return await this.fsqDevelopersPlaces.healthCheck();
				return false; // Por ahora false hasta implementar servicio real
			}
		} catch (error) {
			this.logger.error(`Health check failed: ${error.message}`);
			return false;
		}
	}
}