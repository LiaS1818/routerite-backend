import { OptimizationPayload, CandidatePlace } from '../dto/optimization-payload.dto';
import { ProcessedPlace } from '../../places/dto/processed-place.dto';
import { GenerateItineraryDto } from '../../itineraries/dto/generate-itinerary.dto';

export interface CalculatedParams {
	durationMinutes: number;
	activities: {
		min: number;
		max: number;
		target: number;
	};
	budget: {
		total: number;
		avg_per_activity: number;
		max_per_activity: number;
	};
	experienceTypeIds: string[];
	timeConstraints: {
		start: string;
		end: string;
		duration_minutes: number;
	};
	travelConstraints: {
		max_travel_time_between: number;
		total_travel_time_budget: number;
	};
}

/**
 * Clase helper para construir el payload de optimización de forma estructurada
 */
export class OptimizerPayloadBuilder {
	
	/**
	 * Construye el payload completo para enviar al microservicio Flask
	 */
	static build(
		itinerary: any,
		trip: any,
		processedPlaces: ProcessedPlace[],
		options: GenerateItineraryDto,
		calculatedParams: CalculatedParams
	): OptimizationPayload {
		
		// Generar UUID para request_id
		const requestId = this.generateUuid();
		
		// Construir sección itinerary
		const itinerarySection = this.buildItinerarySection(
			itinerary,
			options,
			calculatedParams
		);
		
		// Mapear candidate_places
		const candidatePlaces = this.mapCandidatePlaces(processedPlaces);
		
		// Construir metadata
		const metadata = this.buildMetadata(requestId, trip);
		
		// Construir payload completo
		const payload: OptimizationPayload = {
			itinerary: itinerarySection,
			candidate_places: candidatePlaces,
			metadata
		};
		
		// Validar payload construido
		this.validatePayload(payload);
		
		return payload;
	}

	/**
	 * Construir sección itinerary del payload
	 */
	private static buildItinerarySection(
		itinerary: any,
		options: GenerateItineraryDto,
		calculatedParams: CalculatedParams
	) {
		// Calcular budget.avg_per_activity
		const avgPerActivity = calculatedParams.budget.total / calculatedParams.activities.target;

		// Calcular budget.max_per_activity (50% del total)
		const maxPerActivity = calculatedParams.budget.total * 0.5;

		return {
			id: itinerary.id,
			date: itinerary.date, // YYYY-MM-DD
			origin: {
				lat: Number(itinerary.lat),
				lng: Number(itinerary.lng)
			},
			time_window: {
				start: calculatedParams.timeConstraints.start, // HH:MM
				end: calculatedParams.timeConstraints.end, // HH:MM
				total_minutes: calculatedParams.timeConstraints.duration_minutes
			},
			budget: {
				total: Number(calculatedParams.budget.total.toFixed(2)),
				avg_per_activity: Number(avgPerActivity.toFixed(2)),
				max_per_activity: Number(maxPerActivity.toFixed(2))
			},
			constraints: {
				activities: {
					min: calculatedParams.activities.min,
					max: calculatedParams.activities.max,
					target: calculatedParams.activities.target
				},
				travel: {
					max_travel_time_between: calculatedParams.travelConstraints.max_travel_time_between,
					total_travel_time_budget: calculatedParams.travelConstraints.total_travel_time_budget
				}
			},
			preferences: {
				experience_type_ids: calculatedParams.experienceTypeIds,
				prioritize_quality: options.prioritize_quality ?? true,
				balance_categories: options.balance_categories ?? true
			}
		};
	}

	/**
	 * Mapear ProcessedPlace a CandidatePlace para Flask
	 */
	private static mapCandidatePlaces(processedPlaces: ProcessedPlace[]): CandidatePlace[] {
		return processedPlaces.map(place => {
			// Asegurar que todos los campos están presentes
			const candidatePlace: CandidatePlace = {
				fsq_place_id: place.fsq_place_id,
				name: place.name,
				location: {
					lat: Number(place.location.lat),
					lng: Number(place.location.lng)
				},
				category: {
					id: place.category.id,
					name: place.category.name
				},
				rating: place.rating,
				price_level: place.price_level,
				distance_from_origin: Math.round(place.distance_from_origin),
				score: Number(place.score.toFixed(1)),
				estimated_cost: Number(place.estimated_cost.toFixed(2)),
				estimated_duration: place.estimated_duration,
				photos: place.photos || [],
				hours: place.hours,
				description: place.description || ''
			};

			return candidatePlace;
		});
	}

	/**
	 * Construir metadata del payload
	 */
	private static buildMetadata(requestId: string, trip: any) {
		return {
			request_id: requestId,
			destination: trip.destination || 'Unknown Destination',
			travelers_count: Number(trip.travelers_count) || 1,
			timestamp: new Date().toISOString() // ISO 8601
		};
	}

	/**
	 * Validar que el payload construido es válido
	 */
	private static validatePayload(payload: OptimizationPayload): void {
		// Verificar que no hay campos undefined en itinerary
		if (!payload.itinerary.id || payload.itinerary.id === undefined) {
			throw new Error('Payload validation failed: itinerary.id is undefined');
		}

		if (!payload.itinerary.date) {
			throw new Error('Payload validation failed: itinerary.date is undefined');
		}

		// Verificar que arrays tienen elementos
		if (!Array.isArray(payload.candidate_places) || payload.candidate_places.length === 0) {
			throw new Error('Payload validation failed: candidate_places array is empty');
		}

		if (!Array.isArray(payload.itinerary.preferences.experience_type_ids) ||
			payload.itinerary.preferences.experience_type_ids.length === 0) {
			throw new Error('Payload validation failed: experience_type_ids array is empty');
		}

		// Verificar que números son válidos
		if (isNaN(payload.itinerary.budget.total) || payload.itinerary.budget.total <= 0) {
			throw new Error('Payload validation failed: invalid budget.total');
		}

		if (isNaN(payload.itinerary.time_window.total_minutes) ||
			payload.itinerary.time_window.total_minutes <= 0) {
			throw new Error('Payload validation failed: invalid time_window.total_minutes');
		}

		// Verificar coordenadas válidas
		const { lat, lng } = payload.itinerary.origin;
		if (isNaN(lat) || lat < -90 || lat > 90) {
			throw new Error('Payload validation failed: invalid origin latitude');
		}

		if (isNaN(lng) || lng < -180 || lng > 180) {
			throw new Error('Payload validation failed: invalid origin longitude');
		}

		// Validar cada lugar candidato
		payload.candidate_places.forEach((place, index) => {
			if (!place.fsq_place_id) {
				throw new Error(`Payload validation failed: candidate_places[${index}].fsq_place_id is undefined`);
			}

			if (!place.name) {
				throw new Error(`Payload validation failed: candidate_places[${index}].name is undefined`);
			}

			if (isNaN(place.location.lat) || isNaN(place.location.lng)) {
				throw new Error(`Payload validation failed: candidate_places[${index}] has invalid coordinates`);
			}

			if (isNaN(place.estimated_cost) || place.estimated_cost < 0) {
				throw new Error(`Payload validation failed: candidate_places[${index}] has invalid estimated_cost`);
			}
		});
	}

	/**
	 * Generar UUID v4 simple
	 */
	private static generateUuid(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
}
