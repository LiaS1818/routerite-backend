import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError } from 'axios';

/**
 * Interface para los parámetros de búsqueda de lugares en Foursquare
 */
export interface FoursquarePlaceSearchRequest {
	// Parámetros de búsqueda principal
	query?: string; // Texto de búsqueda libre (ej: "coffee", "restaurant")

	// Parámetros de ubicación (al menos uno es requerido)
	ll?: string; // Latitud,Longitud (ej: "41.8781,-87.6298")
	near?: string; // Nombre de ubicación para geocoding (ej: "Chicago, IL")

	// Filtros de búsqueda
	radius?: number; // Radio de búsqueda en metros (max 100000)
	categories?: string; // IDs de categorías separadas por comas
	chains?: string; // IDs de cadenas separadas por comas
	exclude_chains?: string; // IDs de cadenas a excluir
	exclude_all_chains?: boolean; // Excluir todas las cadenas

	// Filtros adicionales
	open_now?: boolean; // Solo lugares abiertos ahora
	open_at?: string; // ISO 8601 timestamp para verificar apertura
	min_price?: number; // Precio mínimo (1-4)
	max_price?: number; // Precio máximo (1-4)

	// Paginación y ordenamiento
	limit?: number; // Número de resultados (max 50)
	sort?: 'relevance' | 'rating' | 'distance' | 'popularity'; // Criterio de ordenamiento

	// Campos adicionales a incluir
	fields?: string; // Campos adicionales separados por comas

	// Sesión de usuario para personalización
	session_token?: string; // Token de sesión único por usuario
}

/**
 * Interface para la ubicación de un lugar
 */
export interface FoursquareLocation {
	address?: string;
	address_extended?: string;
	admin_region?: string;
	census_block?: string;
	country?: string;
	cross_street?: string;
	dma?: string;
	formatted_address?: string;
	locality?: string;
	neighborhood?: string[];
	po_box?: string;
	post_town?: string;
	postcode?: string;
	region?: string;
}

/**
 * Interface para las geocodes del lugar
 */
export interface FoursquareGeocodes {
	drop_off?: {
		latitude: number;
		longitude: number;
	};
	main?: {
		latitude: number;
		longitude: number;
	};
	roof?: {
		latitude: number;
		longitude: number;
	};
}

/**
 * Interface para las categorías del lugar
 */
export interface FoursquareCategory {
	id: number;
	name: string;
	short_name?: string;
	plural_name?: string;
	icon?: {
		prefix: string;
		suffix: string;
	};
}

/**
 * Interface para las cadenas asociadas
 */
export interface FoursquareChain {
	id: string;
	name: string;
}

/**
 * Interface para las horas de operación
 */
export interface FoursquareHours {
	display?: string;
	is_local_holiday?: boolean;
	open_now?: boolean;
	regular?: Array<{
		close: string;
		day: number;
		open: string;
	}>;
}

/**
 * Interface para estadísticas del lugar
 */
export interface FoursquareStats {
	total_photos?: number;
	total_ratings?: number;
	total_tips?: number;
}

/**
 * Interface para un lugar individual en la respuesta
 */
export interface FoursquarePlace {
	fsq_id: string;
	name: string;

	// Información de ubicación
	location?: FoursquareLocation;
	geocodes?: FoursquareGeocodes;
	distance?: number; // Distancia en metros desde el punto de búsqueda
	timezone?: string;

	// Categorías y cadenas
	categories?: FoursquareCategory[];
	chains?: FoursquareChain[];

	// Información adicional
	closed_bucket?: string;
	hours?: FoursquareHours;
	hours_popular?: Array<{
		close: string;
		day: number;
		open: string;
	}>;

	// Enlaces y contacto
	link?: string;
	related_places?: {
		parent?: FoursquarePlace;
		children?: FoursquarePlace[];
	};

	// Calificaciones y precios
	rating?: number;
	price?: number; // 1-4

	// Estadísticas
	stats?: FoursquareStats;
	popularity?: number;

	// Medios
	photos?: Array<{
		id: string;
		created_at: string;
		prefix: string;
		suffix: string;
		width: number;
		height: number;
		classifications?: string[];
	}>;

	// Metadatos
	verified?: boolean;
	description?: string;
	tel?: string;
	email?: string;
	website?: string;
	social_media?: {
		facebook_id?: string;
		instagram?: string;
		twitter?: string;
	};

	// Información de fecha
	date_closed?: string;
}

/**
 * Interface para el contexto de geocoding
 */
export interface FoursquareGeocodingContext {
	geo_bounds?: {
		circle?: {
			center?: {
				latitude: number;
				longitude: number;
			};
			radius?: number;
		};
	};
}

/**
 * Interface para la respuesta completa de búsqueda
 */
export interface FoursquarePlaceSearchResponse {
	results: FoursquarePlace[];
	context?: FoursquareGeocodingContext;
}

/**
 * Interface para errores de la API
 */
export interface FoursquareApiError {
	code: string;
	message: string;
	detail?: string;
}

// ==================== SERVICE IMPLEMENTATION ====================

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
		{ data: FoursquarePlaceSearchResponse; timestamp: number }
	>();
	private readonly cacheTTL = 1000 * 60 * 30; // 30 minutos

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {
		this.apiKey = <string>(
			this.configService.get<string>('FOURSQUARE_API_KEY')
		);
		if (!this.apiKey) {
			this.logger.error(
				'FOURSQUARE_API_KEY no está configurado en las variables de entorno'
			);
			throw new Error('Foursquare API key is not configured');
		}
	}

	/**
	 * Busca lugares usando la API de Foursquare Places Search
	 * @param params Parámetros de búsqueda
	 * @returns Respuesta con la lista de lugares encontrados
	 */
	async searchPlaces(
		params: FoursquarePlaceSearchRequest
	): Promise<FoursquarePlaceSearchResponse> {
		this.logger.log('Inside of search places');
		try {
			// Validar parámetros requeridos
			this.validateSearchParams(params);

			// Generar cache key
			const cacheKey = this.generateCacheKey(params);

			// Verificar cache
			const cachedResult = this.getFromCache(cacheKey);
			if (cachedResult) {
				this.logger.debug(
					`Retornando resultado desde cache para: ${cacheKey}`
				);
				return cachedResult;
			}

			// Construir query params
			const queryParams = this.buildQueryParams(params);

			// Log de la búsqueda
			this.logger.debug(
				`Buscando lugares con parámetros: ${JSON.stringify(queryParams)}`
			);

			// Realizar petición a la API
			const response = await firstValueFrom(
				this.httpService.get<FoursquarePlaceSearchResponse>(
					`${this.baseUrl}/search`,
					{
						params: queryParams,
						headers: {
							Authorization: this.apiKey,
							Accept: 'application/json',
							'Accept-Language': 'es-MX', // Para resultados en español de México
						},
					}
				)
			);

			// Procesar y cachear respuesta
			const processedResponse = this.processResponse(response.data);
			this.saveToCache(cacheKey, processedResponse);

			this.logger.debug(
				`Encontrados ${processedResponse.results.length} lugares`
			);

			return processedResponse;
		} catch (error) {
			this.handleError(error);
		}
	}

	/**
	 * Busca lugares por categorías específicas
	 * Método de conveniencia para búsquedas comunes en el contexto de itinerarios
	 */
	async searchPlacesByCategory(
		location: { lat: number; lng: number },
		categories: string[],
		radius: number = 5000,
		limit: number = 20
	): Promise<FoursquarePlaceSearchResponse> {
		return this.searchPlaces({
			ll: `${location.lat},${location.lng}`,
			categories: categories.join(','),
			radius,
			limit,
			sort: 'distance',
		});
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
		response: FoursquarePlaceSearchResponse
	): FoursquarePlaceSearchResponse {
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
	 * Genera una clave única para el cache basada en los parámetros
	 */
	private generateCacheKey(params: FoursquarePlaceSearchRequest): string {
		const sortedParams = Object.keys(params)
			.sort()
			.reduce((acc, key) => {
				acc[key] = params[key];
				return acc;
			}, {} as any);

		return `fsq_places_${JSON.stringify(sortedParams)}`;
	}

	/**
	 * Obtiene un resultado del cache si existe y no ha expirado
	 */
	private getFromCache(key: string): FoursquarePlaceSearchResponse | null {
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
		data: FoursquarePlaceSearchResponse
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

	async getAutocomplete(
		query: string,
		near?: string,
		ll?: string,
		session_token?: string
	) {
		try {
			const params: any = { query, limit: 5 };
			if (near) params.near = near;
			if (ll) params.ll = ll;
			if (session_token) params.session_token = session_token;

			const response = await axios.get(
				'https://places-api.foursquare.com/autocomplete', // <- endpoint v3 correcto
				{
					headers: {
						Authorization:
							'Bearer YFBL2TAKQK4KRHMPAH53FNQ0EVI5QB4CWFBLMFCVV4MIZT3F', // <- tu API key correcta
						Accept: 'application/json',
						'X-Places-Api-Version': '2025-06-17',
					},
					params,
				}
			);

			return response.data.results.map(item => {
				const firstCategory = item.place?.categories?.[0]; // Primera categoría
				return {
					type: item.type ?? null,
					name: item.text?.primary ?? null,
					fsq_id: item.place?.fsq_id ?? null,
					description: item.place?.description ?? null,
					distance: item.place?.distance ?? null,
					price: item.place?.price ?? null,
					rating: item.place?.rating ?? null,
					social_media: item.place?.social_media ?? {},
					tel: item.place?.tel ?? null,
					website: item.place?.website ?? null,
					categories:
						item.place?.categories?.map(cat => ({
							id: cat.id ?? null,
							name: cat.name ?? null,
							short_name: cat.short_name ?? null,
							plural_name: cat.plural_name ?? null,
							icon: cat.icon ?? null,
						})) ?? [],
					category_icon: firstCategory
						? `${firstCategory.icon.prefix}64${firstCategory.icon.suffix}`
						: null, // URL del icono de la primera categoría
					geocodes: item.place?.geocodes ?? null,
					hours: item.place?.hours ?? null,
					location: item.place?.location ?? null,
					photos: item.place?.photos ?? [],
					related_places: item.place?.related_places ?? null,
					tips: item.place?.tips ?? [],
					email: item.place?.email ?? null,
					menu: item.place?.menu ?? null,
					timezone: item.place?.timezone ?? null,
				};
			});
		} catch (error) {
			console.error(error.response?.data || error.message);
			throw new HttpException(
				error.response?.data ||
					'Error fetching autocomplete suggestions',
				error.response?.status || 500
			);
		}
	}

	async searchPlacesNear(
		query: string,
		near?: string,
		ll?: string,
		limit: number = 10
	) {
		const fields = {
			price: true,
			description: true,
			social_media: true,
			photos: true,
		};

		// convertir a string separado por comas para enviarlo en la query
		const fieldsParam = Object.keys(fields)
			.filter(key => fields[key])
			.join(',');

		console.log(fieldsParam);
		try {
			const params: any = { query, limit, fields: fieldsParam };
			if (near) params.near = near;
			if (ll) params.ll = ll;
			const response = await axios.get(
				'https://places-api.foursquare.com/places/search', // <- endpoint v3 correcto
				{
					headers: {
						Authorization:
							'Bearer YFBL2TAKQK4KRHMPAH53FNQ0EVI5QB4CWFBLMFCVV4MIZT3F', // <- tu API key correcta
						Accept: 'application/json',
						'X-Places-Api-Version': '2025-06-17',
					},
					params,
				}
			);
			return response.data.results;
		} catch (error) {
			console.error(error.response?.data || error.message);
			throw new HttpException(
				error.response?.data || 'Error fetching search results',
				error.response?.status || 500
			);
		}
	}
}
