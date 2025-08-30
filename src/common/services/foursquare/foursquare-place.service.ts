import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

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

// ==================== NUEVAS INTERFACES Y TIPOS (FIELDS LEVEL) ====================
/**
 * Tipo de nivel de campos para las respuestas
 */
export type FoursquareFieldsLevel = 'basic' | 'pro' | 'premium' | 'custom';

/**
 * Interface extendida para el request con nivel de campos
 */
export interface FoursquarePlaceSearchRequestExtended
	extends FoursquarePlaceSearchRequest {
	/**
	 * Nivel de campos a retornar
	 * - 'basic': Campos gratuitos básicos
	 * - 'pro': Campos Pro (gratuitos pero más detallados)
	 * - 'premium': Campos Premium (requieren plan de pago)
	 * - 'custom': Lista personalizada de campos
	 */
	fieldsLevel?: FoursquareFieldsLevel;
	/**
	 * Lista personalizada de campos cuando fieldsLevel es 'custom'
	 * Sobrescribe el campo 'fields' original
	 */
	customFields?: string[];
}

/**
 * Definición de campos por nivel
 */
export class FoursquareFields {
	static readonly BASIC_FIELDS = [
		'fsq_id',
		'name',
		'geocodes',
		'location',
		'categories',
		'distance',
		'link',
		'timezone',
	];
	static readonly PRO_FIELDS = [
		...FoursquareFields.BASIC_FIELDS,
		'chains',
		'closed_bucket',
		'email',
		'hours',
		'hours_popular',
		'photos',
		'price',
		'rating',
		'related_places',
		'social_media',
		'stats',
		'tel',
		'verified',
		'website',
	];
	static readonly PREMIUM_FIELDS = [
		...FoursquareFields.PRO_FIELDS,
		'popularity',
		'tips',
		'tastes',
		'date_closed',
		'description',
		'menu',
		'store_id',
		'venuepage_id',
		'attributes',
		'features',
	];
	static getFieldsByLevel(
		level: FoursquareFieldsLevel,
		customFields?: string[]
	): string[] {
		switch (level) {
			case 'basic':
				return FoursquareFields.BASIC_FIELDS;
			case 'pro':
				return FoursquareFields.PRO_FIELDS;
			case 'premium':
				return FoursquareFields.PREMIUM_FIELDS;
			case 'custom':
				return customFields || FoursquareFields.BASIC_FIELDS;
			default:
				return FoursquareFields.BASIC_FIELDS;
		}
	}
	static validateFieldsForLevel(
		fields: string[],
		level: FoursquareFieldsLevel
	): {
		valid: boolean;
		invalidFields: string[];
		suggestedLevel?: FoursquareFieldsLevel;
	} {
		const allowedFields = FoursquareFields.getFieldsByLevel(level);
		const invalidFields = fields.filter(f => !allowedFields.includes(f));
		if (invalidFields.length === 0)
			return { valid: true, invalidFields: [] };
		let suggestedLevel: FoursquareFieldsLevel | undefined;
		if (fields.every(f => FoursquareFields.PRO_FIELDS.includes(f)))
			suggestedLevel = 'pro';
		else if (fields.every(f => FoursquareFields.PREMIUM_FIELDS.includes(f)))
			suggestedLevel = 'premium';
		return { valid: false, invalidFields, suggestedLevel };
	}
}
// ==================== FIN NUEVAS INTERFACES Y TIPOS ====================

// ==================== INTERFACES ORIGINALES RESTAURADAS ====================
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
export interface FoursquareGeocodes {
	drop_off?: { latitude: number; longitude: number };
	main?: { latitude: number; longitude: number };
	roof?: { latitude: number; longitude: number };
}
export interface FoursquareCategory {
	id: number;
	name: string;
	short_name?: string;
	plural_name?: string;
	icon?: { prefix: string; suffix: string };
}
export interface FoursquareChain {
	id: string;
	name: string;
}
export interface FoursquareHours {
	display?: string;
	is_local_holiday?: boolean;
	open_now?: boolean;
	regular?: Array<{ close: string; day: number; open: string }>;
}
export interface FoursquareStats {
	total_photos?: number;
	total_ratings?: number;
	total_tips?: number;
}
export interface FoursquarePlace {
	fsq_id: string;
	name: string;
	location?: FoursquareLocation;
	geocodes?: FoursquareGeocodes;
	distance?: number;
	timezone?: string;
	categories?: FoursquareCategory[];
	chains?: FoursquareChain[];
	closed_bucket?: string;
	hours?: FoursquareHours;
	hours_popular?: Array<{ close: string; day: number; open: string }>;
	link?: string;
	related_places?: { parent?: FoursquarePlace; children?: FoursquarePlace[] };
	rating?: number;
	price?: number;
	stats?: FoursquareStats;
	popularity?: number;
	photos?: Array<{
		id: string;
		created_at: string;
		prefix: string;
		suffix: string;
		width: number;
		height: number;
		classifications?: string[];
	}>;
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
	date_closed?: string;
}
export interface FoursquareGeocodingContext {
	geo_bounds?: {
		circle?: {
			center?: { latitude: number; longitude: number };
			radius?: number;
		};
	};
}
export interface FoursquarePlaceSearchResponse {
	results: FoursquarePlace[];
	context?: FoursquareGeocodingContext;
}
export interface FoursquareApiError {
	code: string;
	message: string;
	detail?: string;
}
// ==================== FIN INTERFACES ORIGINALES RESTAURADAS ====================

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

	/** Establece el nivel de campos por defecto */
	setDefaultFieldsLevel(level: FoursquareFieldsLevel): void {
		this.defaultFieldsLevel = level;
		this.logger.log(`Nivel de campos actualizado a: ${level}`);
	}
	/** Obtiene el nivel de campos por defecto */
	getDefaultFieldsLevel(): FoursquareFieldsLevel {
		return this.defaultFieldsLevel;
	}

	/**
	 * Busca lugares usando la API de Foursquare Places Search
	 * @param params Parámetros de búsqueda
	 * @returns Respuesta con la lista de lugares encontrados
	 */
	async searchPlaces(
		params: FoursquarePlaceSearchRequestExtended
	): Promise<FoursquarePlaceSearchResponse> {
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
				this.httpService.get<FoursquarePlaceSearchResponse>(
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

	/** Búsqueda con campos básicos */
	async searchPlacesBasic(
		params: FoursquarePlaceSearchRequest
	): Promise<FoursquarePlaceSearchResponse> {
		return this.searchPlaces({ ...params, fieldsLevel: 'basic' });
	}
	/** Búsqueda con campos Pro */
	async searchPlacesPro(
		params: FoursquarePlaceSearchRequest
	): Promise<FoursquarePlaceSearchResponse> {
		return this.searchPlaces({ ...params, fieldsLevel: 'pro' });
	}
	/** Búsqueda con campos Premium */
	async searchPlacesPremium(
		params: FoursquarePlaceSearchRequest
	): Promise<FoursquarePlaceSearchResponse> {
		return this.searchPlaces({ ...params, fieldsLevel: 'premium' });
	}
	/** Búsqueda con campos personalizados */
	async searchPlacesWithCustomFields(
		params: FoursquarePlaceSearchRequest,
		customFields: string[]
	): Promise<FoursquarePlaceSearchResponse> {
		const allAvailableFields = FoursquareFields.PREMIUM_FIELDS;
		const invalidFields = customFields.filter(
			f => !allAvailableFields.includes(f)
		);
		if (invalidFields.length)
			this.logger.warn(
				`Campos personalizados inválidos: ${invalidFields.join(', ')}`
			);
		return this.searchPlaces({
			...params,
			fieldsLevel: 'custom',
			customFields: customFields.filter(f =>
				allAvailableFields.includes(f)
			),
		});
	}
	/** Búsqueda optimizada para itinerarios */
	async searchPlacesForItinerary(
		location: { lat: number; lng: number },
		experienceType: 'cultura' | 'gastronomia' | 'aventura' | 'playa',
		options: {
			budget?: { min?: number; max?: number };
			openNow?: boolean;
			includePhotos?: boolean;
			includeRatings?: boolean;
			includePricing?: boolean;
		} = {}
	): Promise<FoursquarePlaceSearchResponse> {
		const customFields = [
			'fsq_id',
			'name',
			'geocodes',
			'location',
			'categories',
			'distance',
		];
		if (options.includePhotos) customFields.push('photos');
		if (options.includeRatings) customFields.push('rating', 'stats');
		if (options.includePricing) customFields.push('price');
		customFields.push('hours', 'hours_popular');
		const categoryMap: Record<string, string> = {
			cultura: '10000,10001,10002,10003',
			gastronomia: '13000,13001,13002,13003',
			aventura: '16000,16001,16002,16003',
			playa: '16015,16016,16017',
		};
		return this.searchPlacesWithCustomFields(
			{
				ll: `${location.lat},${location.lng}`,
				categories: categoryMap[experienceType],
				radius: 10000,
				limit: 30,
				sort: 'popularity',
				open_now: options.openNow,
				min_price: options.budget?.min,
				max_price: options.budget?.max,
			},
			customFields
		);
	}
	/** Genera cache key con nivel de campos */
	private generateCacheKeyWithFields(
		params: FoursquarePlaceSearchRequest,
		fieldsLevel: FoursquareFieldsLevel
	): string {
		const sortedParams = Object.keys(params)
			.sort()
			.reduce((acc, k) => {
				acc[k] = (params as any)[k];
				return acc;
			}, {} as any);
		return `fsq_places_${fieldsLevel}_${JSON.stringify(sortedParams)}`;
	}
	/** Información sobre uso de campos */
	getFieldsUsageInfo(): {
		currentLevel: FoursquareFieldsLevel;
		fieldsCount: number;
		fields: string[];
		costTier: 'free' | 'pro' | 'premium';
		recommendation: string;
	} {
		const fields = FoursquareFields.getFieldsByLevel(
			this.defaultFieldsLevel
		);
		let costTier: 'free' | 'pro' | 'premium';
		let recommendation: string;
		switch (this.defaultFieldsLevel) {
			case 'basic':
				costTier = 'free';
				recommendation =
					'Óptimo para búsquedas rápidas y visualización básica en mapas.';
				break;
			case 'pro':
				costTier = 'pro';
				recommendation =
					'Balance ideal para itinerarios con información detallada sin costo adicional.';
				break;
			case 'premium':
				costTier = 'premium';
				recommendation =
					'Información completa. Considerar solo para usuarios premium de la app.';
				break;
			default:
				costTier = 'free';
				recommendation = 'Configuración personalizada activa.';
		}
		return {
			currentLevel: this.defaultFieldsLevel,
			fieldsCount: fields.length,
			fields,
			costTier,
			recommendation,
		};
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
}
