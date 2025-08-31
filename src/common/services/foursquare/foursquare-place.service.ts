import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
	FoursquarePlaceSearchRequest,
	FoursquarePlaceSearchRequestExtended,
} from './entities/place-search.request.interface';
import { FoursquareFields, FoursquareFieldsLevel } from './foursquare-fields';
import { PlaceSearchResponseInterface } from './entities/place-search.response.interface';
import {
	FoursquarePlaceDetailsRequest,
	FoursquarePlaceDetailsExtendedRequest,
} from './entities/place-details.interface';
import { FoursquarePlaceInterface } from './entities/foursquare-place.interface';

export interface FoursquareApiError {
	code: string;
	message: string;
	detail?: string;
}

/**
 * Servicio para interactuar con la API de Foursquare Places
 * Maneja búsqueda de lugares, caché de resultados y manejo de errores
 */
@Injectable()
export class FoursquarePlacesService {
	private readonly logger = new Logger(FoursquarePlacesService.name);
	private readonly baseUrl = 'https://api.foursquare.com/v3/places';
	private readonly apiKey: string;

	// Cache temporal en memoria (considerar Redis para producción)
	private cache = new Map<
		string,
		{ data: PlaceSearchResponseInterface; timestamp: number }
	>();
	private readonly cacheTTL = 1000 * 60 * 30; // 30 minutos

	/**
	 * Nivel de campos por defecto (configurable via env FSQR_FIELDS_LEVEL)
	 */
	private defaultFieldsLevel: FoursquareFieldsLevel = 'pro';

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {
		this.apiKey = (this.configService.get<string>('FSQR_API_KEY') ||
			this.configService.get<string>('FOURSQUARE_API_KEY') ||
			'') as string;
		if (!this.apiKey) {
			this.logger.error(
				'FOURSQUARE_API_KEY / FSQR_API_KEY no está configurado en las variables de entorno'
			);
			throw new Error('Foursquare API key is not configured');
		}
		const configuredLevel =
			this.configService.get<string>('FSQR_FIELDS_LEVEL');
		if (
			configuredLevel &&
			['basic', 'pro', 'premium'].includes(configuredLevel)
		) {
			this.defaultFieldsLevel = configuredLevel as FoursquareFieldsLevel;
			this.logger.log(
				`Nivel de campos configurado: ${this.defaultFieldsLevel}`
			);
		}
	}

	/**
	 * Busca lugares usando la API de Foursquare Places Search
	 * @param params Parámetros de búsqueda
	 * @returns Respuesta con la lista de lugares encontrados
	 */
	async searchPlaces(
		params: FoursquarePlaceSearchRequestExtended
	): Promise<PlaceSearchResponseInterface> {
		this.logger.log('Inside of search places');
		try {
			// Determinar nivel de campos
			const fieldsLevel = params.fieldsLevel || this.defaultFieldsLevel;
			const fields = FoursquareFields.getFieldsByLevel(
				fieldsLevel,
				params.customFields
			);
			if (fieldsLevel === 'basic' || fieldsLevel === 'pro') {
				const validation = FoursquareFields.validateFieldsForLevel(
					fields,
					fieldsLevel
				);
				if (!validation.valid) {
					this.logger.warn(
						`Campos no disponibles en nivel ${fieldsLevel}: ${validation.invalidFields.join(', ')}. Considera cambiar a nivel: ${validation.suggestedLevel}`
					);
				}
			}
			// Enriquecer params base para API (excluir fieldsLevel/customFields)
			const {
				fieldsLevel: _fl,
				customFields: _cf,
				...rest
			} = params as any;
			const enrichedParams: FoursquarePlaceSearchRequest = {
				...rest,
				fields: fields.join(','),
			};
			// Validar parámetros requeridos
			this.validateSearchParams(enrichedParams);
			// Generar cache key con nivel de campos
			const cacheKey = this.generateCacheKeyWithFields(
				enrichedParams,
				fieldsLevel
			);
			const cachedResult = this.getFromCache(cacheKey);
			if (cachedResult) {
				this.logger.debug(
					`Retornando resultado desde cache para: ${cacheKey}`
				);
				return cachedResult;
			}
			// Construir query params
			const queryParams = this.buildQueryParams(enrichedParams);
			this.logger.debug(
				`Buscando lugares con nivel ${fieldsLevel} (${fields.length} campos) y parámetros: ${JSON.stringify(queryParams)}`
			);
			const response = await firstValueFrom(
				this.httpService.get<PlaceSearchResponseInterface>(
					`${this.baseUrl}/search`,
					{
						params: queryParams,
						headers: {
							Authorization: this.apiKey,
							Accept: 'application/json',
							'Accept-Language': 'es-MX',
						},
					}
				)
			);
			const processedResponse = this.processResponse(response.data);
			this.saveToCache(cacheKey, processedResponse);
			this.logger.debug(
				`Encontrados ${processedResponse.results.length} lugares (nivel ${fieldsLevel})`
			);
			return processedResponse;
		} catch (error) {
			this.handleError(error);
		}
	}

	/**
	 * Obtiene los detalles de un lugar específico usando la API de Foursquare Places Details
	 * @param fsqId ID del lugar en Foursquare
	 * @param params Parámetros adicionales de la solicitud
	 * @returns Detalles del lugar
	 */
	async getPlaceDetails(
		fsqId: string,
		params: FoursquarePlaceDetailsExtendedRequest = {}
	): Promise<any> {
		try {
			// Determinar nivel de campos
			const fieldsLevel = params.fieldsLevel || this.defaultFieldsLevel;
			const fields = FoursquareFields.getFieldsByLevel(
				fieldsLevel,
				params.customFields
			);

			if (fieldsLevel === 'basic' || fieldsLevel === 'pro') {
				const validation = FoursquareFields.validateFieldsForLevel(
					fields,
					fieldsLevel
				);
				if (!validation.valid) {
					this.logger.warn(
						`Campos no disponibles en nivel ${fieldsLevel}: ${validation.invalidFields.join(
							', '
						)}. Considera cambiar a nivel: ${validation.suggestedLevel}`
					);
				}
			}

			// Generar cache key
			const cacheKey = `fsq_place_${fieldsLevel}_${fsqId}`;
			const cachedResult = this.getFromCache(cacheKey);
			if (cachedResult) {
				this.logger.debug(
					`Retornando detalles desde cache para lugar: ${fsqId}`
				);
				return cachedResult;
			}

			// Construir query params
			const queryParams: FoursquarePlaceDetailsRequest = {
				fields: fields.join(','),
			};

			console.log("params: ", params)

			this.logger.debug(
				`Obteniendo detalles del lugar ${fsqId} con nivel ${fieldsLevel} (${fields.length} campos)`
			);

			const response = await firstValueFrom(
				this.httpService.get(`${this.baseUrl}/${fsqId}`, {
					params: queryParams,
					headers: {
						Authorization: this.apiKey,
						Accept: 'application/json',
						'Accept-Language': 'es-MX',
					},
				})
			);
			const obtainedPlace: FoursquarePlaceInterface = response.data;
			console.log("response place details: ", obtainedPlace)

			this.saveToCache(cacheKey, obtainedPlace);

			this.logger.debug(
				`Detalles obtenidos exitosamente para lugar ${fsqId}`
			);
			return obtainedPlace;
		} catch (error) {
			if (error?.response?.status === 404) {
				throw new HttpException(
					'Lugar no encontrado',
					HttpStatus.NOT_FOUND
				);
			}
			this.handleError(error);
		}
	}

	/**
	 * Busca un lugar específico usando coordenadas y nombre, y obtiene sus detalles con fotos
	 */
	async findPlaceAndGetDetails(
		location: { name: string; lat: string | number; lng: string | number },
		options: { fieldsLevel?: FoursquareFieldsLevel; customFields?: string[] } = {}
	): Promise<{ fsqId?: string; photoUrl?: string }> {
		try {
			let fsqId: string | undefined = "4d37d5252a7b59413dacfc47";
			const { lat, lng, name } = location;

			// Search for the place using coordinates and name
			const searchResponse = await this.searchPlaces({
				ll: `${lat},${lng}`,
				query: name,
				radius: 100, // Search within 100 meters
				limit: 1,
				fieldsLevel: 'basic'
			});

			console.log("Search Response: ", searchResponse)

			if (searchResponse.results?.length > 0) {
				for (const place of searchResponse.results) {
					// Verify if this is likely the same place
					if (this.isSimilarPlace(place, location)) {
						fsqId = place.fsq_id;
					}
				}
			}

			console.log("obtained fsqId: ", fsqId)

			// If we found a matching place, get its details
			if (fsqId) {
				const placeDetails = await this.getPlaceDetails(fsqId, {
					fieldsLevel: 'pro',
					customFields: ['photos']
				});

				console.log("Selected place details: ", placeDetails)
				if (placeDetails.photos?.length > 0) {
					const primaryPhoto = placeDetails.photos[0];
					const dimensions = '390x360'
					return {
						fsqId,
						photoUrl: `${primaryPhoto.prefix}${dimensions}${primaryPhoto.suffix}`
					};
				}
				// Example URL result:
				// https://fastly.4sqi.net/img/general/390x360/11197279_wsyG_eVS3MpH27-frhDjrEd2I1rcnh5UE5vdwxeEB3Q.jpg

				return { fsqId };

			}

			return {};
		} catch (error) {
			this.logger.warn(
				`Failed to find place or get details: ${error.message}`
			);
			return {};
		}
	}

	/**
	 * Compare a Foursquare place with our location data to verify it's the same place
	 */
	private isSimilarPlace(
		fsqPlace: any,
		ourPlace: { name: string; lat: string | number; lng: string | number }
	): boolean {
		// If names are very different, it's probably not the same place
		const nameSimilarity = this.calculateStringSimilarity(
			fsqPlace.name.toLowerCase(),
			ourPlace.name.toLowerCase()
		);

		// Calculate distance between coordinates
		const distance = this.calculateDistance(
			parseFloat(ourPlace.lat.toString()),
			parseFloat(ourPlace.lng.toString()),
			fsqPlace.geocodes.main.latitude,
			fsqPlace.geocodes.main.longitude
		);

		// Consider it a match if:
		// 1. Names are at least 60% similar
		// 2. Location is within 100 meters
		return nameSimilarity >= 0.6 && distance <= 100;
	}

	/**
	 * Calculate similarity between two strings (simplified Levenshtein ratio)
	 */
	private calculateStringSimilarity(str1: string, str2: string): number {
		const maxLength = Math.max(str1.length, str2.length);
		if (maxLength === 0) return 1.0;

		const distance = this.levenshteinDistance(str1, str2);
		return 1 - distance / maxLength;
	}

	/**
	 * Calculate Levenshtein distance between two strings
	 */
	private levenshteinDistance(str1: string, str2: string): number {
		const m = str1.length;
		const n = str2.length;
		const dp: number[][] = Array.from({ length: m + 1 }, () =>
			Array(n + 1).fill(0)
		);

		for (let i = 0; i <= m; i++) dp[i][0] = i;
		for (let j = 0; j <= n; j++) dp[0][j] = j;

		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				if (str1[i - 1] === str2[j - 1]) {
					dp[i][j] = dp[i - 1][j - 1];
				} else {
					dp[i][j] = 1 + Math.min(
						dp[i - 1][j],     // deletion
						dp[i][j - 1],     // insertion
						dp[i - 1][j - 1]  // substitution
					);
				}
			}
		}

		return dp[m][n];
	}

	/**
	 * Calculate distance between two points in meters using Haversine formula
	 */
	private calculateDistance(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	): number {
		const R = 6371e3; // Earth's radius in meters
		const φ1 = (lat1 * Math.PI) / 180;
		const φ2 = (lat2 * Math.PI) / 180;
		const Δφ = ((lat2 - lat1) * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	/** Genera cache key con nivel de campos */
	private generateCacheKeyWithFields(
		params: FoursquarePlaceSearchRequest | FoursquarePlaceDetailsRequest,
		fieldsLevel: FoursquareFieldsLevel
	): string {
		const sortedParams = Object.keys(params)
			.sort()
			.reduce((acc, k) => {
				acc[k] = (params as any)[k];
				return acc;
			}, {} as any);
		return `fsq_${JSON.stringify(sortedParams)}_${fieldsLevel}`;
	}

	/**
	 * Valida que los parámetros de búsqueda sean correctos
	 */
	private validateSearchParams(params: FoursquarePlaceSearchRequest): void {
		// Validar que al menos un parámetro de ubicación esté presente
		if (!params.ll && !params.near) {
			throw new HttpException(
				'Se requiere al menos un parámetro de ubicación (ll o near)',
				HttpStatus.BAD_REQUEST
			);
		}

		// Validar formato de ll si está presente
		if (params.ll && !this.isValidLatLng(params.ll)) {
			throw new HttpException(
				'Formato inválido para ll. Debe ser "latitud,longitud"',
				HttpStatus.BAD_REQUEST
			);
		}

		// Validar límites de parámetros numéricos
		if (params.radius && (params.radius < 1 || params.radius > 100000)) {
			throw new HttpException(
				'El radio debe estar entre 1 y 100000 metros',
				HttpStatus.BAD_REQUEST
			);
		}

		if (params.limit && (params.limit < 1 || params.limit > 50)) {
			throw new HttpException(
				'El límite debe estar entre 1 y 50',
				HttpStatus.BAD_REQUEST
			);
		}

		if (
			params.min_price &&
			(params.min_price < 1 || params.min_price > 4)
		) {
			throw new HttpException(
				'El precio mínimo debe estar entre 1 y 4',
				HttpStatus.BAD_REQUEST
			);
		}

		if (
			params.max_price &&
			(params.max_price < 1 || params.max_price > 4)
		) {
			throw new HttpException(
				'El precio máximo debe estar entre 1 y 4',
				HttpStatus.BAD_REQUEST
			);
		}
	}

	/**
	 * Valida el formato de latitud,longitud
	 */
	private isValidLatLng(ll: string): boolean {
		const regex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
		if (!regex.test(ll)) return false;

		const [lat, lng] = ll.split(',').map(Number);
		return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
	}

	/**
	 * Construye los query parameters para la petición
	 */
	private buildQueryParams(
		params: FoursquarePlaceSearchRequest
	): Record<string, any> {
		const queryParams: Record<string, any> = {};

		// Agregar solo los parámetros que tienen valor
		Object.keys(params).forEach(key => {
			const value = params[key];
			if (value !== undefined && value !== null && value !== '') {
				queryParams[key] = value;
			}
		});

		// Valores por defecto si no se especifican
		if (!queryParams.limit) {
			queryParams.limit = 20;
		}

		if (!queryParams.sort) {
			queryParams.sort = 'relevance';
		}

		return queryParams;
	}

	/**
	 * Procesa la respuesta de la API
	 */
	private processResponse(
		response: PlaceSearchResponseInterface
	): PlaceSearchResponseInterface {
		// Filtrar lugares sin coordenadas válidas
		const validResults = response.results.filter(
			place =>
				place.geocodes?.main?.latitude &&
				place.geocodes?.main?.longitude
		);

		// Ordenar por rating si está disponible
		validResults.sort((a, b) => {
			if (a.rating && b.rating) return b.rating - a.rating;
			if (a.rating) return -1;
			if (b.rating) return 1;
			return 0;
		});

		return {
			...response,
			results: validResults,
		};
	}

	/**
	 * Obtiene un resultado del cache si existe y no ha expirado
	 */
	private getFromCache(key: string): PlaceSearchResponseInterface | null {
		const cached = this.cache.get(key);

		if (!cached) return null;

		const now = Date.now();
		if (now - cached.timestamp > this.cacheTTL) {
			this.cache.delete(key);
			return null;
		}

		return cached.data;
	}

	/**
	 * Guarda un resultado en el cache
	 */
	private saveToCache(
		key: string,
		data: any
	): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
		});

		// Limpiar cache si es muy grande
		if (this.cache.size > 100) {
			const oldestKey = this.cache.keys().next().value;
			this.cache.delete(oldestKey);
		}
	}

	/**
	 * Limpia el cache completamente
	 */
	clearCache(): void {
		this.cache.clear();
		this.logger.debug('Cache limpiado');
	}

	/**
	 * Maneja errores de la API
	 */
	private handleError(error: any): never {
		if (error instanceof HttpException) {
			this.logger.error(`Error de Foursquare API: ${error.message}`);
			throw error;
		}

		const axiosError = error as AxiosError<{ error?: FoursquareApiError }>;

		if (axiosError.response) {
			const status = axiosError.response.status;
			const errorData = axiosError.response.data?.error;

			this.logger.error(
				`Error de Foursquare API: ${status} - ${errorData?.message || 'Sin mensaje'}`
			);

			switch (status) {
				case 400:
					throw new HttpException(
						errorData?.message ||
							'Parámetros de búsqueda inválidos',
						HttpStatus.BAD_REQUEST
					);
				case 401:
					throw new HttpException(
						'API key inválida o no autorizada',
						HttpStatus.UNAUTHORIZED
					);
				case 403:
					throw new HttpException(
						'Acceso denegado a este recurso',
						HttpStatus.FORBIDDEN
					);
				case 404:
					throw new HttpException(
						'Recurso no encontrado',
						HttpStatus.NOT_FOUND
					);
				case 429:
					throw new HttpException(
						'Límite de rate limit excedido. Intente más tarde',
						HttpStatus.TOO_MANY_REQUESTS
					);
				case 500:
				case 502:
				case 503:
					throw new HttpException(
						'Error en el servidor de Foursquare. Intente más tarde',
						HttpStatus.SERVICE_UNAVAILABLE
					);
				default:
					throw new HttpException(
						errorData?.message || 'Error al buscar lugares',
						status || HttpStatus.INTERNAL_SERVER_ERROR
					);
			}
		} else if (axiosError.request) {
			this.logger.error('No se recibió respuesta de Foursquare API');
			throw new HttpException(
				'No se pudo conectar con el servicio de búsqueda de lugares',
				HttpStatus.SERVICE_UNAVAILABLE
			);
		} else {
			this.logger.error(`Error inesperado: ${axiosError.message}`);
			throw new HttpException(
				'Error inesperado al buscar lugares',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
