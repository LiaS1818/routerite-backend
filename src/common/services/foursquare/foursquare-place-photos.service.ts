import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

// ==================== REQUEST INTERFACES ====================

/**
 * Interface para los parámetros de búsqueda de fotos
 */
export interface FoursquarePlacePhotosRequest {
	/**
	 * ID único del lugar en Foursquare (fsq_id)
	 * Requerido en la URL del endpoint
	 */
	fsq_id: string;

	/**
	 * Número máximo de fotos a retornar
	 * Default: 1, Max: 50
	 */
	limit?: number;

	/**
	 * Clasificaciones de fotos para filtrar
	 * Valores posibles: 'food', 'indoor', 'menu', 'outdoor'
	 * Se pueden combinar múltiples valores separados por comas
	 */
	classifications?: string;

	/**
	 * Ordenamiento de las fotos
	 * Default: 'newest'
	 */
	sort?: 'newest' | 'oldest' | 'popular';
}

/**
 * Interface para parámetros de construcción de URL de imagen
 */
export interface FoursquarePhotoUrlParams {
	/**
	 * Prefijo de la URL de la foto
	 */
	prefix: string;

	/**
	 * Sufijo de la URL de la foto (extensión del archivo)
	 */
	suffix: string;

	/**
	 * Tamaño deseado de la imagen
	 * Formato: 'widthxheight' o tamaños predefinidos
	 */
	size?:
		| 'original'
		| '36x36'
		| '100x100'
		| '300x300'
		| '500x500'
		| '600x600'
		| string;
}

/**
 * Interface para solicitar múltiples tamaños de una foto
 */
export interface FoursquarePhotoMultiSizeRequest {
	/**
	 * ID único del lugar
	 */
	fsq_id: string;

	/**
	 * ID de la foto específica
	 */
	photo_id: string;

	/**
	 * Array de tamaños deseados
	 */
	sizes: string[];
}

// ==================== RESPONSE INTERFACES ====================

/**
 * Interface para los datos de clasificación de una foto
 */
export interface FoursquarePhotoClassification {
	/**
	 * Tipo de clasificación
	 */
	type:
		| 'food'
		| 'indoor'
		| 'menu'
		| 'outdoor'
		| 'drink'
		| 'ambience'
		| string;

	/**
	 * Puntuación de confianza de la clasificación (0-1)
	 */
	confidence?: number;
}

/**
 * Interface para metadatos adicionales de la foto
 */
export interface FoursquarePhotoMetadata {
	/**
	 * Ancho original de la imagen en píxeles
	 */
	width: number;

	/**
	 * Alto original de la imagen en píxeles
	 */
	height: number;

	/**
	 * Orientación de la foto
	 */
	orientation?: 'landscape' | 'portrait' | 'square';

	/**
	 * Tamaño del archivo en bytes (si está disponible)
	 */
	size_bytes?: number;

	/**
	 * Formato del archivo
	 */
	format?: string;
}

/**
 * Interface para el usuario que subió la foto
 */
export interface FoursquarePhotoUser {
	/**
	 * ID del usuario (puede estar ofuscado)
	 */
	id?: string;

	/**
	 * Nombre del usuario o fuente
	 */
	name?: string;

	/**
	 * Tipo de fuente
	 */
	type?: 'user' | 'venue' | 'page' | 'chain' | 'foursquare';
}

/**
 * Interface para una foto individual
 */
export interface FoursquarePhoto {
	/**
	 * ID único de la foto
	 */
	id: string;

	/**
	 * Fecha y hora de creación en formato ISO 8601
	 */
	created_at: string;

	/**
	 * Prefijo de la URL de la imagen
	 * Se combina con size y suffix para formar la URL completa
	 */
	prefix: string;

	/**
	 * Sufijo/extensión de la imagen (ej: .jpg, .png)
	 */
	suffix: string;

	/**
	 * Ancho de la imagen en píxeles
	 */
	width: number;

	/**
	 * Alto de la imagen en píxeles
	 */
	height: number;

	/**
	 * Clasificaciones automáticas de la foto
	 */
	classifications?: string[];

	/**
	 * Clasificaciones detalladas con confianza
	 */
	classifications_detailed?: FoursquarePhotoClassification[];

	/**
	 * Información del usuario/fuente que subió la foto
	 */
	uploaded_by?: FoursquarePhotoUser;

	/**
	 * Si la foto es la foto principal del lugar
	 */
	is_primary?: boolean;

	/**
	 * Metadatos adicionales
	 */
	metadata?: FoursquarePhotoMetadata;

	/**
	 * Texto alternativo para accesibilidad
	 */
	alt_text?: string;

	/**
	 * Caption o descripción de la foto
	 */
	caption?: string;

	/**
	 * Si la foto ha sido verificada por el negocio
	 */
	verified?: boolean;

	/**
	 * Visibilidad de la foto
	 */
	visibility?: 'public' | 'private';
}

/**
 * Interface para la respuesta completa de fotos
 */
export interface FoursquarePlacePhotosResponse {
	/**
	 * Array de fotos del lugar
	 */
	photos: FoursquarePhoto[];

	/**
	 * Número total de fotos disponibles
	 */
	total?: number;

	/**
	 * Información de paginación
	 */
	pagination?: {
		has_more: boolean;
		cursor?: string;
	};
}

/**
 * Interface para URLs de fotos en múltiples tamaños
 */
export interface FoursquarePhotoUrls {
	/**
	 * ID de la foto
	 */
	photo_id: string;

	/**
	 * URLs generadas para cada tamaño solicitado
	 */
	urls: {
		[size: string]: string;
	};

	/**
	 * URL original de máxima calidad
	 */
	original_url: string;
}

/**
 * Interface para errores de la API
 */
export interface FoursquarePhotosApiError {
	code: string;
	message: string;
	detail?: string;
}

// ==================== SERVICE IMPLEMENTATION ====================

/**
 * Servicio para gestionar fotos de lugares usando la API de Foursquare
 * Maneja obtención de fotos, generación de URLs y optimización de imágenes
 */
@Injectable()
export class FoursquarePhotosService {
	private readonly logger = new Logger(FoursquarePhotosService.name);
	private readonly baseUrl = 'https://api.foursquare.com/v3/places';
	private readonly apiKey: string;

	// Cache temporal en memoria para fotos
	private photosCache = new Map<
		string,
		{ data: FoursquarePlacePhotosResponse; timestamp: number }
	>();
	private readonly cacheTTL = 1000 * 60 * 60;

	// Tamaños predefinidos comúnmente usados en la aplicación
	private readonly commonSizes = {
		thumbnail: '100x100',
		small: '300x300',
		medium: '500x500',
		large: '600x600',
		xlarge: '800x800',
		original: 'original',
	};

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
	 * Obtiene las fotos de un lugar específico
	 * @param params Parámetros de búsqueda incluyendo fsq_id
	 * @returns Lista de fotos del lugar
	 */
	async getPlacePhotos(
		params: FoursquarePlacePhotosRequest
	): Promise<FoursquarePlacePhotosResponse> {
		try {
			// Validar parámetros
			this.validatePhotoParams(params);

			// Generar cache key
			const cacheKey = this.generateCacheKey(params);

			// Verificar cache
			const cachedResult = this.getFromCache(cacheKey);
			if (cachedResult) {
				this.logger.debug(
					`Retornando fotos desde cache para lugar: ${params.fsq_id}`
				);
				return cachedResult;
			}

			// Construir query params
			const queryParams = this.buildQueryParams(params);

			// Log de la búsqueda
			this.logger.debug(
				`Obteniendo fotos para lugar ${params.fsq_id} con parámetros: ${JSON.stringify(queryParams)}`
			);

			// Realizar petición a la API
			const response = await firstValueFrom(
				this.httpService.get<FoursquarePhoto[]>(
					`${this.baseUrl}/${params.fsq_id}/photos`,
					{
						params: queryParams,
						headers: {
							Authorization: this.apiKey,
							Accept: 'application/json',
						},
					}
				)
			);

			// Procesar respuesta
			const processedResponse = this.processPhotosResponse(response.data);

			// Cachear respuesta
			this.saveToCache(cacheKey, processedResponse);

			this.logger.debug(
				`Obtenidas ${processedResponse.photos.length} fotos para lugar ${params.fsq_id}`
			);

			return processedResponse;
		} catch (error) {
			this.handleError(error);
		}
	}

	/**
	 * Obtiene la foto principal de un lugar
	 * @param fsq_id ID del lugar
	 * @param size Tamaño deseado de la imagen
	 * @returns URL de la foto principal o null si no existe
	 */
	async getPrimaryPhoto(
		fsq_id: string,
		size: string = '500x500'
	): Promise<string | null> {
		try {
			const photos = await this.getPlacePhotos({
				fsq_id,
				limit: 1,
				sort: 'popular',
			});

			if (photos.photos.length === 0) {
				return null;
			}

			return this.buildPhotoUrl({
				prefix: photos.photos[0].prefix,
				suffix: photos.photos[0].suffix,
				size,
			});
		} catch (error) {
			this.logger.error(
				`Error obteniendo foto principal para lugar ${fsq_id}: ${error.message}`
			);
			return null;
		}
	}

	/**
	 * Obtiene fotos de comida de un lugar
	 * Útil para restaurantes y lugares gastronómicos
	 */
	async getFoodPhotos(
		fsq_id: string,
		limit: number = 10
	): Promise<FoursquarePlacePhotosResponse> {
		return this.getPlacePhotos({
			fsq_id,
			limit,
			classifications: 'food,menu',
			sort: 'popular',
		});
	}

	/**
	 * Obtiene fotos del ambiente/exterior de un lugar
	 * Útil para mostrar el ambiente general del lugar
	 */
	async getAmbiencePhotos(
		fsq_id: string,
		limit: number = 10
	): Promise<FoursquarePlacePhotosResponse> {
		return this.getPlacePhotos({
			fsq_id,
			limit,
			classifications: 'outdoor,indoor',
			sort: 'popular',
		});
	}

	/**
	 * Construye la URL completa de una foto
	 * @param params Parámetros de la foto (prefix, suffix, size)
	 * @returns URL completa de la imagen
	 */
	buildPhotoUrl(params: FoursquarePhotoUrlParams): string {
		const size = params.size || this.commonSizes.medium;

		// Si es tamaño original, no agregamos dimensiones
		if (size === 'original') {
			return `${params.prefix}original${params.suffix}`;
		}

		// Construir URL con el tamaño especificado
		return `${params.prefix}${size}${params.suffix}`;
	}

	/**
	 * Genera múltiples URLs para diferentes tamaños de una foto
	 * @param photo Objeto de foto de Foursquare
	 * @param sizes Array de tamaños deseados
	 * @returns Objeto con URLs para cada tamaño
	 */
	generateMultipleSizeUrls(
		photo: FoursquarePhoto,
		sizes?: string[]
	): FoursquarePhotoUrls {
		const requestedSizes = sizes || Object.values(this.commonSizes);
		const urls: { [size: string]: string } = {};

		requestedSizes.forEach(size => {
			urls[size] = this.buildPhotoUrl({
				prefix: photo.prefix,
				suffix: photo.suffix,
				size,
			});
		});

		return {
			photo_id: photo.id,
			urls,
			original_url: this.buildPhotoUrl({
				prefix: photo.prefix,
				suffix: photo.suffix,
				size: 'original',
			}),
		};
	}

	/**
	 * Obtiene todas las URLs de fotos para un lugar en múltiples tamaños
	 * Útil para pre-cargar imágenes en diferentes resoluciones
	 */
	async getPlacePhotoUrls(
		fsq_id: string,
		limit: number = 5,
		sizes?: string[]
	): Promise<FoursquarePhotoUrls[]> {
		const photosResponse = await this.getPlacePhotos({
			fsq_id,
			limit,
			sort: 'popular',
		});

		return photosResponse.photos.map(photo =>
			this.generateMultipleSizeUrls(photo, sizes)
		);
	}

	/**
	 * Obtiene fotos optimizadas para mostrar en un carrusel
	 * @param fsq_id ID del lugar
	 * @param options Opciones de configuración del carrusel
	 */
	async getCarouselPhotos(
		fsq_id: string,
		options: {
			limit?: number;
			thumbnailSize?: string;
			fullSize?: string;
			includeFood?: boolean;
			includeAmbience?: boolean;
		} = {}
	): Promise<{
		photos: Array<{
			id: string;
			thumbnail_url: string;
			full_url: string;
			original_url: string;
			caption?: string;
			classifications?: string[];
		}>;
		total: number;
	}> {
		const {
			limit = 10,
			thumbnailSize = '100x100',
			fullSize = '600x600',
			includeFood = true,
			includeAmbience = true,
		} = options;

		// Construir clasificaciones basadas en opciones
		let classifications: string[] = [];
		if (includeFood) classifications.push('food', 'menu');
		if (includeAmbience) classifications.push('indoor', 'outdoor');

		const photosResponse = await this.getPlacePhotos({
			fsq_id,
			limit,
			classifications:
				classifications.length > 0
					? classifications.join(',')
					: undefined,
			sort: 'popular',
		});

		const carouselPhotos = photosResponse.photos.map(photo => ({
			id: photo.id,
			thumbnail_url: this.buildPhotoUrl({
				prefix: photo.prefix,
				suffix: photo.suffix,
				size: thumbnailSize,
			}),
			full_url: this.buildPhotoUrl({
				prefix: photo.prefix,
				suffix: photo.suffix,
				size: fullSize,
			}),
			original_url: this.buildPhotoUrl({
				prefix: photo.prefix,
				suffix: photo.suffix,
				size: 'original',
			}),
			caption: photo.caption,
			classifications: photo.classifications,
		}));

		return {
			photos: carouselPhotos,
			total: photosResponse.total || photosResponse.photos.length,
		};
	}

	/**
	 * Obtiene una foto específica para usar como portada
	 * Prioriza fotos outdoor/indoor sobre food para portadas
	 */
	async getCoverPhoto(
		fsq_id: string,
		preferredSize: string = '800x600'
	): Promise<{
		url: string;
		photo_id: string;
		width: number;
		height: number;
	} | null> {
		try {
			// Primero intentar obtener fotos de ambiente
			let photosResponse = await this.getPlacePhotos({
				fsq_id,
				limit: 1,
				classifications: 'outdoor,indoor',
				sort: 'popular',
			});

			// Si no hay fotos de ambiente, obtener cualquier foto popular
			if (photosResponse.photos.length === 0) {
				photosResponse = await this.getPlacePhotos({
					fsq_id,
					limit: 1,
					sort: 'popular',
				});
			}

			if (photosResponse.photos.length === 0) {
				return null;
			}

			const photo = photosResponse.photos[0];

			return {
				url: this.buildPhotoUrl({
					prefix: photo.prefix,
					suffix: photo.suffix,
					size: preferredSize,
				}),
				photo_id: photo.id,
				width: photo.width,
				height: photo.height,
			};
		} catch (error) {
			this.logger.error(
				`Error obteniendo foto de portada para lugar ${fsq_id}: ${error.message}`
			);
			return null;
		}
	}

	/**
	 * Valida los parámetros de búsqueda de fotos
	 */
	private validatePhotoParams(params: FoursquarePlacePhotosRequest): void {
		// Validar fsq_id
		if (!params.fsq_id || params.fsq_id.trim() === '') {
			throw new HttpException(
				'El fsq_id del lugar es requerido',
				HttpStatus.BAD_REQUEST
			);
		}

		// Validar límite
		if (params.limit !== undefined) {
			if (params.limit < 1 || params.limit > 50) {
				throw new HttpException(
					'El límite debe estar entre 1 y 50',
					HttpStatus.BAD_REQUEST
				);
			}
		}

		// Validar clasificaciones
		if (params.classifications) {
			const validClassifications = ['food', 'indoor', 'menu', 'outdoor'];
			const requestedClassifications = params.classifications.split(',');

			const invalidClassifications = requestedClassifications.filter(
				c => !validClassifications.includes(c.trim())
			);

			if (invalidClassifications.length > 0) {
				throw new HttpException(
					`Clasificaciones inválidas: ${invalidClassifications.join(', ')}. ` +
						`Valores válidos: ${validClassifications.join(', ')}`,
					HttpStatus.BAD_REQUEST
				);
			}
		}

		// Validar ordenamiento
		if (params.sort) {
			const validSorts = ['newest', 'oldest', 'popular'];
			if (!validSorts.includes(params.sort)) {
				throw new HttpException(
					`Ordenamiento inválido: ${params.sort}. ` +
						`Valores válidos: ${validSorts.join(', ')}`,
					HttpStatus.BAD_REQUEST
				);
			}
		}
	}

	/**
	 * Construye los query parameters para la petición
	 */
	private buildQueryParams(
		params: FoursquarePlacePhotosRequest
	): Record<string, any> {
		const queryParams: Record<string, any> = {};

		if (params.limit !== undefined) {
			queryParams.limit = params.limit;
		}

		if (params.classifications) {
			queryParams.classifications = params.classifications;
		}

		if (params.sort) {
			queryParams.sort = params.sort;
		}

		// Valores por defecto
		if (!queryParams.limit) {
			queryParams.limit = 10;
		}

		if (!queryParams.sort) {
			queryParams.sort = 'popular';
		}

		return queryParams;
	}

	/**
	 * Procesa la respuesta de fotos de la API
	 */
	private processPhotosResponse(
		photos: FoursquarePhoto[]
	): FoursquarePlacePhotosResponse {
		// Filtrar fotos inválidas (sin prefix o suffix)
		const validPhotos = photos.filter(
			photo => photo.prefix && photo.suffix && photo.width && photo.height
		);

		// Enriquecer con metadatos adicionales
		const enrichedPhotos = validPhotos.map(photo => ({
			...photo,
			metadata: {
				width: photo.width,
				height: photo.height,
				orientation: this.getPhotoOrientation(
					photo.width,
					photo.height
				),
				format: photo.suffix?.replace('.', ''),
			},
		}));

		return {
			photos: enrichedPhotos,
			total: enrichedPhotos.length,
		};
	}

	/**
	 * Determina la orientación de una foto basada en sus dimensiones
	 */
	private getPhotoOrientation(
		width: number,
		height: number
	): 'landscape' | 'portrait' | 'square' {
		const ratio = width / height;

		if (Math.abs(ratio - 1) < 0.1) {
			return 'square';
		} else if (ratio > 1) {
			return 'landscape';
		} else {
			return 'portrait';
		}
	}

	/**
	 * Genera una clave única para el cache
	 */
	private generateCacheKey(params: FoursquarePlacePhotosRequest): string {
		return `fsq_photos_${params.fsq_id}_${params.limit || 10}_${params.sort || 'popular'}_${params.classifications || 'all'}`;
	}

	/**
	 * Obtiene un resultado del cache si existe y no ha expirado
	 */
	private getFromCache(key: string): FoursquarePlacePhotosResponse | null {
		const cached = this.photosCache.get(key);

		if (!cached) return null;

		const now = Date.now();
		if (now - cached.timestamp > this.cacheTTL) {
			this.photosCache.delete(key);
			return null;
		}

		return cached.data;
	}

	/**
	 * Guarda un resultado en el cache
	 */
	private saveToCache(
		key: string,
		data: FoursquarePlacePhotosResponse
	): void {
		this.photosCache.set(key, {
			data,
			timestamp: Date.now(),
		});

		// Limpiar cache si es muy grande
		if (this.photosCache.size > 200) {
			const oldestKey = this.photosCache.keys().next().value;
			this.photosCache.delete(oldestKey);
		}
	}

	/**
	 * Limpia el cache de fotos
	 */
	clearCache(): void {
		this.photosCache.clear();
		this.logger.debug('Cache de fotos limpiado');
	}

	/**
	 * Limpia el cache de fotos para un lugar específico
	 */
	clearPlaceCache(fsq_id: string): void {
		const keysToDelete: string[] = [];

		this.photosCache.forEach((value, key) => {
			if (key.includes(fsq_id)) {
				keysToDelete.push(key);
			}
		});

		keysToDelete.forEach(key => this.photosCache.delete(key));

		this.logger.debug(`Cache limpiado para lugar ${fsq_id}`);
	}

	/**
	 * Maneja errores de la API
	 */
	private handleError(error: any): never {
		if (error instanceof HttpException) {
			throw error;
		}

		const axiosError = error as AxiosError<{
			error?: FoursquarePhotosApiError;
		}>;

		if (axiosError.response) {
			const status = axiosError.response.status;
			const errorData = axiosError.response.data?.error;

			this.logger.error(
				`Error de Foursquare Photos API: ${status} - ${errorData?.message || 'Sin mensaje'}`
			);

			switch (status) {
				case 400:
					throw new HttpException(
						errorData?.message ||
							'Parámetros inválidos para obtener fotos',
						HttpStatus.BAD_REQUEST
					);
				case 401:
					throw new HttpException(
						'API key inválida o no autorizada',
						HttpStatus.UNAUTHORIZED
					);
				case 403:
					throw new HttpException(
						'Acceso denegado a las fotos de este lugar',
						HttpStatus.FORBIDDEN
					);
				case 404:
					throw new HttpException(
						'Lugar no encontrado o no tiene fotos',
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
						errorData?.message ||
							'Error al obtener fotos del lugar',
						status || HttpStatus.INTERNAL_SERVER_ERROR
					);
			}
		} else if (axiosError.request) {
			this.logger.error(
				'No se recibió respuesta de Foursquare Photos API'
			);
			throw new HttpException(
				'No se pudo conectar con el servicio de fotos',
				HttpStatus.SERVICE_UNAVAILABLE
			);
		} else {
			this.logger.error(`Error inesperado: ${axiosError.message}`);
			throw new HttpException(
				'Error inesperado al obtener fotos',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
