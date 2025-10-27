import { Injectable, Logger, NotFoundException, BadRequestException, UnprocessableEntityException, ServiceUnavailableException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { GenerateItineraryDto } from '../dto/generate-itinerary.dto';
import { GenerationResponseDto, GenerationMetadataDto, ItineraryWithActivitiesDto } from '../dto/generation-response.dto';
import { ItinerariesService } from '../itineraries.service';
import { ItineraryValidatorService } from './itinerary-validator.service';
import { OptimizerClientService } from '../../optimizer/optimizer-client.service';
import { OptimizationResponse, OptimizationSuccessResponse, OptimizationErrorResponse } from '../../optimizer/dto/optimization-response.dto';
import { OptimizerPayloadBuilder, CalculatedParams } from '../../optimizer/helpers/optimizer-payload.builder';
import { PlacesSearchService } from '../../places/services/places-search.service';
import { PlacesProcessorService } from '../../places/services/places-processor.service';
import { PlaceSearchParams } from '../../places/dto/place-search.dto';
import { ProcessedPlace } from '../../places/dto/processed-place.dto';
import  * as TimeUtils from '../../../shared/utils/time.utils';
import { GenerationConstants } from '../../../shared/constants/generation.constants';
import { Itinerary, Activity, Trip } from '../../../database/models';
import { Sequelize } from 'sequelize-typescript';
import { OptimizationPayload } from '../../optimizer/dto/optimization-payload.dto';
import { FoursquareMockService } from '../../../common/services/foursquare/foursquare-mock.service';
import { PlaceSearchMetadataParam } from '@api/fsq-developers-places';
import { SupabaseStorageService } from '../../supabase/supabase-storage.service';
import { ConfigService } from '@nestjs/config';
import fsqDevelopersPlaces from '@api/fsq-developers-places';
import { FSQRPlace } from '../../../common/interfaces/FSQRPlace.interface';
import { FsqPlace } from '../../places/interfaces/fsq-place';

interface ActivityLimits {
	min: number;
	max: number;
	target: number;
}

interface BudgetConstraints {
	total: number;
	avg_per_activity: number;
	max_per_activity: number;
}

interface TimeConstraints {
	start: string;
	end: string;
	duration_minutes: number;
}

interface TravelConstraints {
	max_travel_time_between: number;
	total_travel_time_budget: number;
}

interface OptimizationConstraints {
	time_window: TimeConstraints;
	activities: ActivityLimits;
	budget: BudgetConstraints;
	travel: TravelConstraints;
}

interface OptimizationPreferences {
	experience_type_ids: string[];
	prioritize_quality: boolean;
	balance_categories: boolean;
}

@Injectable()
export class ItineraryGeneratorService {
	private readonly logger = new Logger(ItineraryGeneratorService.name);

	constructor(
		@InjectModel(Itinerary)
		private readonly itineraryModel: typeof Itinerary,
		@InjectModel(Activity)
		private readonly activityModel: typeof Activity,
		private readonly sequelize: Sequelize,
		private readonly itinerariesService: ItinerariesService,
		private readonly itineraryValidatorService: ItineraryValidatorService,
		private readonly optimizerClientService: OptimizerClientService,
		private readonly placesSearchService: PlacesSearchService,
		private readonly placesProcessorService: PlacesProcessorService,
		private readonly fsqDevelopersPlaces: FoursquareMockService,
		private readonly supabaseStorageService: SupabaseStorageService,
		private readonly configService: ConfigService
	) {}

	async generateItinerary(
		itineraryId: number,
		userId: number,
		options: GenerateItineraryDto
	): Promise<GenerationResponseDto> {
		const startTime = Date.now();
		const requestId = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;
		let transaction: Transaction | null = null;

		try {
			this.logger.log(`[${requestId}] Starting itinerary generation for itinerary ${itineraryId}, user ${userId}`);

			// PASO 1: OBTENCIÓN Y VALIDACIÓN DE DATOS
			const { itinerary, trip } = await this.getAndValidateData(itineraryId, userId, requestId);

			// PASO 2: CÁLCULOS DERIVADOS
			const derivedCalculations = this.calculateDerivedParameters(itinerary, options, requestId);

			// PASO 3: OBTENCIÓN DE LUGARES CANDIDATOS
			const { candidatePlaces, fsqrPlacesMap } = await this.obtainCandidatePlaces(itinerary, derivedCalculations, requestId, options);

			// PASO 4: PREPARACIÓN DE PAYLOAD PARA FLASK
			const optimizationPayload = this.prepareOptimizationPayload(
				itinerary,
				trip,
				candidatePlaces,
				derivedCalculations,
				requestId
			);

			// PASO 5: LLAMADA AL MICROSERVICIO FLASK
			const optimizationResult = await this.callFlaskOptimizer(optimizationPayload, requestId);

			// PASO 6: PERSISTENCIA EN BASE DE DATOS
			transaction = await this.sequelize.transaction();
			await this.persistOptimizationResult(itinerary, optimizationResult, options, transaction, requestId, fsqrPlacesMap);
			await transaction.commit();

			// PASO 6.5: OBTENER Y SUBIR FOTOS DE ACTIVIDADES
			await this.populateActivityImages(itineraryId, requestId);

			// PASO 7: CONSTRUCCIÓN DE RESPUESTA
			const finalResponse = await this.buildFinalResponse(itineraryId, optimizationResult, startTime, requestId);

			this.logger.log(`[${requestId}] Generation completed successfully in ${finalResponse.generation_info?.solve_time_seconds}s`);
			return finalResponse;

		} catch (error) {
			// Rollback de transacción si existe
			if (transaction) {
				await transaction.rollback();
				this.logger.warn(`[${requestId}] Transaction rolled back due to error`);
			}

			this.logger.error(`[${requestId}] Error generating itinerary: ${error.message}`, error.stack);
			throw this.handleGenerationError(error, requestId);
		}
	}

	/**
	 * PASO 4: Preparación de Payload para Flask usando OptimizerPayloadBuilder
	 */
	private prepareOptimizationPayload(
		itinerary: any,
		trip: any,
		candidatePlaces: ProcessedPlace[],
		calculations: any,
		requestId: string
	): OptimizationPayload {
		this.logger.log(`[${requestId}] PASO 4: Preparing optimization payload using OptimizerPayloadBuilder`);

		// Mapear calculations a CalculatedParams
		const calculatedParams: CalculatedParams = {
			durationMinutes: calculations.durationMinutes,
			activities: calculations.activities,
			budget: calculations.budget,
			experienceTypeIds: calculations.experienceTypeIds,
			timeConstraints: calculations.timeConstraints,
			travelConstraints: calculations.travelConstraints
		};

		// Usar el builder helper para construir el payload
		const payload = OptimizerPayloadBuilder.build(
			itinerary,
			trip,
			candidatePlaces,
			new GenerateItineraryDto(), // Default options for now
			calculatedParams
		);

		this.logger.log(`[${requestId}] Optimization payload built: ${candidatePlaces.length} candidates, budget: ${payload.itinerary.budget.total}`);
		return payload;
	}

	/**
	 * PASO 5: Llamada al Microservicio Flask con nuevos DTOs
	 */
	private async callFlaskOptimizer(payload: OptimizationPayload, requestId: string): Promise<OptimizationResponse> {
		this.logger.log(`[${requestId}] PASO 5: Calling Flask microservice for optimization`);

		try {
			const optimizationResult = await this.optimizerClientService.optimizeItinerary(payload);

			// Manejar respuesta según el nuevo DTO
			if (!optimizationResult.success) {
				const errorResponse = optimizationResult as OptimizationErrorResponse;
				this.logger.warn(`[${requestId}] Flask optimization failed: ${errorResponse.error.code}`);

				throw new UnprocessableEntityException({
					success: false,
					message: errorResponse.error.message || 'No se pudo optimizar el itinerario',
					error: {
						code: errorResponse.error.code,
						type: 'OPTIMIZATION_ERROR',
						details: errorResponse.error.diagnosis.details
					},
					suggestions: errorResponse.error.suggestions.map(s => `${s.action}: ${s.description}`),
					fallback_options: {
						manual_selection: errorResponse.error.alternative_options.fallback_mode === 'MANUAL',
						retry_with_relaxed_params: errorResponse.error.alternative_options.retry_recommended
					}
				});
			}

			const successResponse = optimizationResult as OptimizationSuccessResponse;
			this.logger.log(`[${requestId}] Flask optimization successful: ${successResponse.optimized_activities.length} activities using ${successResponse.optimization_info.algorithm}`);
			return optimizationResult;

		} catch (error) {
			if (error instanceof UnprocessableEntityException) {
				throw error;
			}

			this.logger.error(`[${requestId}] Error calling Flask optimizer: ${error.message}`);
			throw error;
		}
	}

	/**
	 * PASO 6: Persistencia en Base de Datos usando la nueva estructura de respuesta
	 */
	private async persistOptimizationResult(
		itinerary: any,
		optimizationResult: OptimizationResponse,
		options: GenerateItineraryDto,
		transaction: Transaction,
		requestId: string,
		fsqrPlacesMap: Map<string, FSQRPlace>
	): Promise<void> {
		this.logger.log(`[${requestId}] PASO 6: Persisting optimization result to database`);

		// Solo persistir si fue exitoso
		if (!optimizationResult.success) {
			this.logger.warn(`[${requestId}] Skipping persistence - optimization was not successful`);
			return;
		}

		const successResponse = optimizationResult as OptimizationSuccessResponse;

		try {
			// 6.2. Eliminar actividades existentes
			const deletedCount = await this.activityModel.destroy({
				where: { itinerary_id: itinerary.id },
				transaction
			});

			this.logger.log(`[${requestId}] Deleted ${deletedCount} existing activities`);

			// 6.3. Crear nuevas actividades
			const newActivities: Activity[] = [];
			const optimizedActivities = successResponse.optimized_activities;
			optimizedActivities.pop()

			for (const activity of successResponse.optimized_activities) {
				// Recuperar la respuesta completa de FSQR usando el fsq_place_id
				const fsqrPlace = fsqrPlacesMap.get(activity.place.fsq_place_id);

				if (!fsqrPlace) {
					this.logger.warn(`[${requestId}] No FSQR place found in map for fsq_place_id: ${activity.place.fsq_place_id}, using simplified version`);
				}

				const activityData = {
					itinerary_id: itinerary.id,
					name: activity.place.name,
					description: activity.place.category.name, // Usando el nombre de la categoría como descripción por defecto
					lat: activity.place.location.lat,
					lng: activity.place.location.lng,
					place: fsqrPlace || activity.place, // Guardar la respuesta completa de FSQR si está disponible, sino la simplificada
					sequence: activity.sequence,
					start_time: activity.timing.arrival_time,
					end_time: activity.timing.departure_time,
					budget: activity.cost.estimated,
					transportation_mode: 'driving', // Default por ahora
					transportation_duration: activity.timing.travel_time_from_previous,
					notes: Array.isArray(activity.notes) ? activity.notes.join('; ') : activity.notes || '',
					distance_to_start: 0
				};

				// @ts-ignore
				const createdActivity = await this.activityModel.create(activityData, { transaction });
				newActivities.push(createdActivity);
			}

			this.logger.log(`[${requestId}] Created ${newActivities.length} new activities`);

			// 6.4. Actualizar metadata del itinerario con información rica
			const updateData = {
				is_generated: true,
				max_activities: options.max_activities || 5,
				generation_metadata: {
					algorithm: successResponse.optimization_info.algorithm,
					solve_time_seconds: successResponse.optimization_info.solve_time_seconds,
					candidates_evaluated: successResponse.optimization_info.candidates_provided,
					candidates_selected: successResponse.optimization_info.candidates_selected,
					solution_status: successResponse.optimization_info.solution_status,
					objective_value: successResponse.optimization_info.objective_value,
					time_utilization: successResponse.summary.time_stats.time_utilization,
					budget_utilization: successResponse.summary.budget_stats.budget_utilization,
					average_score: successResponse.summary.quality_stats.average_score,
					categories_distribution: successResponse.summary.quality_stats.categories_distribution,
					generated_at: successResponse.metadata.generated_at,
					processor: successResponse.metadata.processor,
					optimization_model: successResponse.metadata.optimization_model,
					request_id: requestId
				}
			};

			await this.itineraryModel.update(updateData, {
				where: { id: itinerary.id },
				transaction
			});

			this.logger.log(`[${requestId}] Updated itinerary metadata with rich optimization data`);

		} catch (error) {
			this.logger.error(`[${requestId}] Error persisting optimization result: ${error.message}`);
			throw error;
		}
	}

	/**
	 * PASO 7: Construcción de Respuesta usando datos ricos de Flask
	 */
	private async buildFinalResponse(
		itineraryId: number,
		optimizationResult: OptimizationResponse,
		startTime: number,
		requestId: string
	): Promise<GenerationResponseDto> {
		this.logger.log(`[${requestId}] PASO 7: Building final response with rich data`);

		try {
			// 7.1. Recargar itinerario con relaciones
			const fullItinerary = await this.itinerariesService.getItineraryWithActivities(itineraryId);

			// 7.2. Construir objeto de respuesta con datos ricos
			let generationInfo: GenerationMetadataDto;
			let itineraryResponse: ItineraryWithActivitiesDto;

			if (optimizationResult.success) {
				const successResponse = optimizationResult as OptimizationSuccessResponse;

				generationInfo = {
					candidates_evaluated: successResponse.optimization_info.candidates_provided,
					solve_time_seconds: (Date.now() - startTime) / 1000,
					algorithm: successResponse.optimization_info.algorithm
				};

				itineraryResponse = {
					id: fullItinerary.id,
					date: fullItinerary.date.toString(),
					start_time: fullItinerary.start_time,
					end_time: fullItinerary.end_time,
					budget: fullItinerary.budget,
					activities: fullItinerary.activities?.map(activity => ({
						id: activity.id,
						name: activity.place?.name || 'Lugar desconocido',
						fsq_place_id: activity.place?.fsq_place_id || '',
						estimated_duration: activity.end_time && activity.start_time
							? TimeUtils.calculateMinutesDifference(activity.start_time, activity.end_time)
							: 120,
						estimated_cost: activity.budget || 0,
						order: activity.sequence || 0,
						start_time: activity.start_time,
						end_time: activity.end_time,
						transportation_mode: activity.transportation_mode,
						notes: activity.notes
					})) || [],
					summary: `Itinerario optimizado: ${successResponse.summary.activities_count} actividades, ` +
						`${successResponse.summary.time_stats.time_utilization.toFixed(1)}% utilización de tiempo, ` +
						`${successResponse.summary.budget_stats.budget_utilization.toFixed(1)}% utilización de presupuesto, ` +
						`score promedio: ${successResponse.summary.quality_stats.average_score.toFixed(1)}`
				};
			} else {
				// Para casos de error, usar datos básicos
				generationInfo = {
					candidates_evaluated: 0,
					solve_time_seconds: (Date.now() - startTime) / 1000,
					algorithm: 'NONE'
				};

				itineraryResponse = {
					id: itineraryId,
					date: fullItinerary.date.toString() || '2025-10-15',
					start_time: fullItinerary.start_time || '09:00',
					end_time: fullItinerary.end_time || '18:00',
					budget: fullItinerary.budget || 0,
					activities: [],
					summary: 'No se pudo generar el itinerario debido a restricciones'
				};
			}

			// 7.3. Loggear éxito
			this.logger.log(
				`[${requestId}] SUCCESS - User: ${fullItinerary.trip?.user_id}, ` +
				`Itinerary: ${itineraryId}, Activities: ${fullItinerary.activities?.length || 0}, ` +
				`SolveTime: ${generationInfo.solve_time_seconds}s`
			);

			// 7.4. Retornar respuesta
			return {
				success: true,
				message: 'Itinerario generado exitosamente',
				itinerary: itineraryResponse,
				generation_info: generationInfo,
				request_id: requestId
			};

		} catch (error) {
			this.logger.error(`[${requestId}] Error building final response: ${error.message}`);
			throw error;
		}
	}

	/**
	 * PASO 1: Obtención y Validación de Datos
	 */
	private async getAndValidateData(itineraryId: number, userId: number, requestId: string) {
		this.logger.log(`[${requestId}] PASO 1: Obtaining and validating data`);

		// 1.1. Obtener el itinerario de la base de datos
		const itinerary = await this.getItineraryWithTrip(itineraryId);

		// 1.2. Verificar pertenencia al usuario
		if (itinerary.trip.user_id !== userId) {
			throw new ForbiddenException('No tienes permisos para generar este itinerario');
		}

		// 1.3. Validar que el itinerario está configurado
		this.itineraryValidatorService.validateConfigured(itinerary);

		// 1.4. Validar coherencia de parámetros
		this.itineraryValidatorService.validateParameters(itinerary);

		// 1.5. Validar que la fecha está en rango del trip
		this.itineraryValidatorService.validateDateInTripRange(itinerary, itinerary.trip);

		this.logger.log(`[${requestId}] Data validation completed`);
		return { itinerary, trip: itinerary.trip };
	}

	/**
	 * PASO 2: Cálculos Derivados
	 */
	private calculateDerivedParameters(itinerary: any, options: GenerateItineraryDto, requestId: string) {
		this.logger.log(`[${requestId}] PASO 2: Calculating derived parameters`);

		// 2.1. Calcular duración disponible
		const durationMinutes = TimeUtils.calculateMinutesDifference(
			itinerary.start_time,
			itinerary.end_time
		);

		// 2.2. Calcular límites de actividades
		const maxActivitiesByTime = Math.floor(durationMinutes / GenerationConstants.MIN_ACTIVITY_DURATION);
		const minActivitiesByTime = Math.max(
			GenerationConstants.MIN_ACTIVITIES,
			Math.ceil(durationMinutes / GenerationConstants.IDEAL_ACTIVITY_DURATION)
		);

		const maxActivities = Math.min(options.max_activities || 5, maxActivitiesByTime);
		const minActivities = Math.max(options.min_activities || 3, minActivitiesByTime);
		const targetActivities = Math.round((maxActivities + minActivities) / 2)

		const activities: ActivityLimits = {
			min: minActivities,
			max: maxActivities,
			target: targetActivities
		};

		// 2.3. Calcular presupuesto promedio por actividad
		const budget: BudgetConstraints = {
			total: Number(itinerary.budget),
			avg_per_activity: itinerary.budget / targetActivities,
			max_per_activity: itinerary.budget * GenerationConstants.MAX_BUDGET_PER_ACTIVITY_RATIO
		};

		// 2.4. Parsear experience_type_ids
		const experienceTypeIds = itinerary.experience_type_ids
			.split(',')
			.map((id: string) => id.trim())
			.filter((id: string) => id !== '');

		// 2.5. Cálculos de tiempo y viaje
		const timeConstraints: TimeConstraints = {
			start: itinerary.start_time,
			end: itinerary.end_time,
			duration_minutes: durationMinutes
		};

		const travelConstraints: TravelConstraints = {
			max_travel_time_between: GenerationConstants.MAX_TRAVEL_TIME_BETWEEN,
			total_travel_time_budget: durationMinutes * GenerationConstants.TRAVEL_TIME_BUDGET_RATIO
		};

		this.logger.log(`[${requestId}] Calculated parameters: ${JSON.stringify({
			duration: durationMinutes,
			activities,
			budget: budget.avg_per_activity,
			experienceTypes: experienceTypeIds.length
		})}`);

		return {
			durationMinutes,
			activities,
			budget,
			experienceTypeIds,
			timeConstraints,
			travelConstraints
		};
	}

	/**
	 * PASO 3: Obtención de Lugares Candidatos usando PlacesSearchService y PlacesProcessorService
	 */
	private async obtainCandidatePlaces(itinerary: any, calculations: any, requestId: string, options: GenerateItineraryDto): Promise<{ candidatePlaces: ProcessedPlace[], fsqrPlacesMap: Map<string, FSQRPlace> }> {
		this.logger.log(`[${requestId}] PASO 3: Obtaining candidate places using PlacesSearchService and PlacesProcessorService`);

		const fsqrApiKey = this.configService.get<string>('FSQR_API_KEY') || " ";
		const useFSQRMock = this.configService.get('USE_FSQR_MOCK', true);
		const fsqrService =  useFSQRMock != "false" ? this.fsqDevelopersPlaces : fsqDevelopersPlaces;

		try {
			const candidates: ProcessedPlace[] = [];
			const fsqrPlacesMap = new Map<string, FSQRPlace>();

			// 1. Si existe starting_location, buscar el mejor match en FSQR
			if (itinerary.starting_location) {
				this.logger.log(`[${requestId}] Searching FSQR place for starting_location: ${JSON.stringify(itinerary.starting_location)}`);
				try {
					fsqrService.auth(fsqrApiKey);
					// Buscar por nombre si está disponible
					const { latLng } = itinerary.starting_location;
					const longitudeMatch = latLng.match(/lng:\s*([-+]?\d*\.\d+|\d+)/) || [
						null,
						'0.0',
					];
					const longitude = longitudeMatch[1];
					const latitudeMatch = latLng.match(/lat:\s*([-+]?\d*\.\d+|\d+),/) || [
						null,
						'0.0',
					];
					const latitude = latitudeMatch[1];
					let searchParams: PlaceSearchMetadataParam = {
						limit: 1,
						query: itinerary.starting_location.name,
						ll: `${latitude},${longitude}`,
						fields: "fsq_place_id,name,description,distance,rating,tel,website,social_media,latitude,longitude,categories,hours,location,stats",
						radius: 2500,
						sort: 'RELEVANCE',
						"X-Places-Api-Version": "2025-06-17",
					};

					// DEBUG: Log the exact parameters being sent
					this.logger.debug(`[${requestId}] Calling fsqrService.placeSearch with params:`, JSON.stringify(searchParams, null, 2));
					this.logger.debug(`[${requestId}] fsqrService type: ${fsqrService.constructor.name}`);
					const searchResult = await fsqrService.placeSearch(searchParams);
					const places = (searchResult.data.results || []) as any[];
					let bestMatch: any = places[0];
					if (bestMatch && bestMatch.fsq_place_id) {
						const placeDetailsResp = await fsqrService.placeDetails({
							fsq_place_id: String(bestMatch.fsq_place_id),
							fields: "fsq_place_id,name,description,distance,rating,tel,website,social_media,latitude,longitude,categories,hours,location,stats,price,photos",
							"X-Places-Api-Version": "2025-06-17",
						});
						const fsqrPlace = placeDetailsResp.data;
						// @ts-ignore
						fsqrPlacesMap.set(fsqrPlace.fsq_place_id, fsqrPlace);
						const category = (fsqrPlace.categories && fsqrPlace.categories.length > 0) ? fsqrPlace.categories[0] : { fsq_category_id: '', name: '' };
						const hours = fsqrPlace.hours ? {
							display: fsqrPlace.hours.display || '',
							is_open: fsqrPlace.hours.open_now || false,
							opening_time: fsqrPlace.hours.regular && fsqrPlace.hours.regular[0] ? fsqrPlace.hours.regular[0].open : undefined,
							closing_time: fsqrPlace.hours.regular && fsqrPlace.hours.regular[0] ? fsqrPlace.hours.regular[0].close : undefined,
						} : null;
						const processed: ProcessedPlace = {
							fsq_place_id: fsqrPlace.fsq_place_id || '',
							name: fsqrPlace.name || '',
							location: {
								lat: bestMatch.latitude,
								lng: bestMatch.longitude
							},
							category: {
								id: category.fsq_category_id || '',
								name: category.name || '',
							},
							rating: typeof fsqrPlace.rating === 'number' ? fsqrPlace.rating : null,
							price_level: typeof fsqrPlace.price === 'number' ? fsqrPlace.price : 1,
							photos: Array.isArray(fsqrPlace.photos) ? fsqrPlace.photos.map((p: any) => `${p.prefix}original${p.suffix}`) : [],
							distance_from_origin: 0,
							score: 100,
							estimated_cost: typeof fsqrPlace.price === 'number' ? fsqrPlace.price : 0,
							estimated_duration: 30,
							hours: hours,
							description: fsqrPlace.description || '',
						};
						candidates.push(processed);
					} else {
						this.logger.warn(`[${requestId}] No FSQR match found for starting_location`);
					}
				} catch (e) {
					this.logger.warn(`[${requestId}] Could not fetch FSQR place for starting_location: ${e.message}`);
				}
			}

			// 2. Obtener el resto de candidatos (24 si hay lugar de inicio, 25 si no)
			const searchParams: PlaceSearchParams = {
				lat: itinerary.lat,
				lng: itinerary.lng,
				radius: options.search_radius || GenerationConstants.DEFAULT_SEARCH_RADIUS,
				categories: calculations.experienceTypeIds,
				limit: candidates.length > 0 ? 24 : 25,
				date: new Date(itinerary.date),
				time_window: {
					start: calculations.timeConstraints.start,
					end: calculations.timeConstraints.end
				},
			};

			this.logger.log(`[${requestId}] Searching with params:`, {
				lat: searchParams.lat,
				lng: searchParams.lng,
				radius: searchParams.radius,
				categories: searchParams.categories,
				limit: searchParams.limit
			});

			const rawPlaces = await this.placesSearchService.searchPlaces(searchParams, requestId);
			this.logger.log(`[${requestId}] Found ${rawPlaces.length} raw places from PlacesSearchService`);

			// Guardar todas las respuestas completas de FSQR en el mapa
			for (const fsqrPlace of rawPlaces) {
				// @ts-ignore
				fsqrPlacesMap.set(fsqrPlace.fsq_place_id, fsqrPlace);
			}

			const processedPlaces = await this.placesProcessorService.processPlaces(rawPlaces, searchParams);
			this.logger.log(`[${requestId}] Processed ${processedPlaces.length} valid places using PlacesProcessorService`);

			if (processedPlaces.length + candidates.length < calculations.activities.min) {
				throw new UnprocessableEntityException({
					success: false,
					message: 'No se encontraron suficientes lugares que cumplan los criterios',
					error: {
						code: GenerationConstants.ERROR_CODES.INSUFFICIENT_PLACES,
						type: GenerationConstants.ERROR_TYPES.OPTIMIZATION_ERROR,
						details: `Se encontraron ${processedPlaces.length + candidates.length} lugares, pero se necesitan al menos ${calculations.activities.min}`
					},
					suggestions: [
						'Amplía el radio de búsqueda',
						'Ajusta los tipos de experiencia seleccionados',
						'Reduce el rating mínimo requerido',
						'Considera aumentar el presupuesto disponible'
					],
					fallback_options: {
						manual_selection: true,
						retry_with_relaxed_params: true
					}
				});
			}

			this.logger.log(`[${requestId}] Built FSQR places map with ${fsqrPlacesMap.size} entries`);
			return {
				candidatePlaces: [...candidates, ...processedPlaces],
				fsqrPlacesMap
			};

		} catch (error) {
			this.logger.error(`[${requestId}] Error obtaining candidate places: ${error.message}`);
			throw error;
		}
	}

	/**
	 * PASO 6.5: Obtener y subir fotos de actividades desde Foursquare a Supabase
	 */
	private async populateActivityImages(itineraryId: number, requestId: string): Promise<void> {
		this.logger.log(`[${requestId}] PASO 6.5: Populating activity images from Foursquare`);

		try {
			// Obtener todas las actividades del itinerario
			const activities = await this.activityModel.findAll({
				where: { itinerary_id: itineraryId },
			});

			this.logger.log(`[${requestId}] Found ${activities.length} activities to process images`);

			// Autenticar el servicio Foursquare
			const fsqrApiKey = this.configService.get<string>('FSQR_API_KEY') || " ";
			const useFSQRMock = this.configService.get('USE_FSQR_MOCK', true);
			const fsqrService =  useFSQRMock != "false" ? this.fsqDevelopersPlaces : fsqDevelopersPlaces;
			fsqrService.auth(fsqrApiKey);

			// Procesar cada actividad en paralelo (con límite para no sobrecargar)
			const imagePromises = activities.map(async (activity) => {
				try {
					// Obtener fsq_place_id del objeto place guardado
					const fsqPlaceId = activity.place?.fsq_place_id;
					
					if (!fsqPlaceId) {
						this.logger.warn(`[${requestId}] Activity ${activity.id} doesn't have fsq_place_id, skipping image`);
						return;
					}

					this.logger.debug(`[${requestId}] Processing images for activity ${activity.id} (${activity.name})`);

					// Obtener fotos del lugar desde Foursquare
					const photosResponse = await fsqrService.placePhotos({
						fsq_place_id: fsqPlaceId,
						"X-Places-Api-Version": "2025-06-17"
					});

					const photos = photosResponse.data;
					
					if (!photos || photos.length === 0) {
						this.logger.warn(`[${requestId}] No photos found for activity ${activity.id} (${fsqPlaceId})`);
						return;
					}

					// Tomar la primera foto disponible
					const firstPhoto = photos[0];
					const photoUrl = `${firstPhoto.prefix}390x360${firstPhoto.suffix}`;
					
					this.logger.debug(`[${requestId}] Found photo for activity ${activity.id}: ${photoUrl}`);

					// Generar ruta para Supabase usando el método del SupabaseStorageService
					const activityImagePath = this.supabaseStorageService.generateActivityImagePath(activity.id, photoUrl);
					
					// Subir imagen a Supabase
					const supabaseImageUrl = await this.supabaseStorageService.uploadImageFromUrl(photoUrl, activityImagePath);
					
					// Actualizar el campo img_url en la base de datos
					await activity.update({ img_url: supabaseImageUrl });
					
					this.logger.debug(`[${requestId}] Successfully updated activity ${activity.id} with image: ${supabaseImageUrl}`);

				} catch (error) {
					// Log error but don't fail the entire process
					this.logger.warn(`[${requestId}] Failed to process image for activity ${activity.id}: ${error.message}`);
				}
			});

			// Esperar que todas las imágenes se procesen
			await Promise.all(imagePromises);
			
			this.logger.log(`[${requestId}] Completed image population for ${activities.length} activities`);

		} catch (error) {
			// Log error but don't fail the entire generation process
			this.logger.error(`[${requestId}] Error populating activity images: ${error.message}`);
			// No re-lanzamos el error para que la generación continúe
		}
	}

	/**
	 * Obtiene el itinerario con el trip incluido
	 */
	private async getItineraryWithTrip(itineraryId: number): Promise<any> {
		return this.itineraryModel.findOne({
			where: { id: itineraryId },
			include: [
				{
					model: Trip
				}
			]
		})
	}


	/**
	 * Maneja los errores de generación y los mapea apropiadamente
	 */
	private handleGenerationError(error: any, requestId: string): Error {
		if (error instanceof NotFoundException ||
			error instanceof BadRequestException ||
			error instanceof ForbiddenException ||
			error instanceof UnprocessableEntityException ||
			error instanceof ServiceUnavailableException) {
			return error; // Ya están formateados correctamente
		}

		// Error genérico de sistema
		this.logger.error(`[${requestId}] Unhandled error: ${error.message}`, error.stack);

		return new ServiceUnavailableException({
			success: false,
			message: 'Error interno del servidor durante la generación',
			error: {
				code: GenerationConstants.ERROR_CODES.GENERATION_FAILED,
				type: GenerationConstants.ERROR_TYPES.SYSTEM_ERROR,
				details: 'Ha ocurrido un error inesperado durante la generación del itinerario'
			},
			suggestions: [
				'Intenta nuevamente en unos momentos',
				'Si el problema persiste, contacta al soporte técnico'
			],
			fallback_options: {
				manual_selection: true,
				retry_with_relaxed_params: false
			}
		});
	}
}
