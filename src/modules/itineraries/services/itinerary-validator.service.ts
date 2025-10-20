import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as TimeUtils  from '../../../shared/utils/time.utils'
import { GenerationConstants } from '../../../shared/constants/generation.constants';

@Injectable()
export class ItineraryValidatorService {
	private readonly logger = new Logger(ItineraryValidatorService.name);

	async validateItineraryExists(itineraryId: number, userId: number): Promise<void> {
		this.logger.log(`Validating itinerary ${itineraryId} for user ${userId}`);

		if (itineraryId <= 0) {
			throw new BadRequestException('ID de itinerario inválido');
		}

		// TODO: Implementar validación real con la base de datos
		// const itinerary = await this.itineraryRepository.findOne({
		//   where: { id: itineraryId, user_id: userId }
		// });
		//
		// if (!itinerary) {
		//   throw new NotFoundException('Itinerario no encontrado o no tienes permisos para acceder a él');
		// }
	}

	async validateGenerationFeasibility(itineraryId: number): Promise<void> {
		this.logger.log(`Validating generation feasibility for itinerary ${itineraryId}`);

		// TODO: Implementar validaciones de factibilidad:
		// - Verificar que el itinerario tenga suficiente tiempo
		// - Verificar que haya lugares disponibles en la zona
		// - Verificar que el presupuesto sea realista
		// - Verificar que no esté ya generado y activo
	}

	/**
	 * Valida que el itinerario esté completamente configurado
	 * Verifica que el campo virtual configured es true identificando campos faltantes
	 */
	validateConfigured(itinerary: any): void {
		this.logger.log(`Validating configuration for itinerary ${itinerary.id}`);

		const missingFields: string[] = [];

		// Verificar budget !== null
		if (itinerary.budget === null || itinerary.budget === undefined) {
			missingFields.push('budget');
		}

		// Verificar date !== null
		if (!itinerary.date) {
			missingFields.push('date');
		}

		// Verificar start_time !== null
		if (!itinerary.start_time) {
			missingFields.push('start_time');
		}

		// Verificar end_time !== null
		if (!itinerary.end_time) {
			missingFields.push('end_time');
		}

		// Verificar experience_type_ids !== null y no está vacío
		if (!itinerary.experience_type_ids || itinerary.experience_type_ids.trim() === '') {
			missingFields.push('experience_type_ids');
		}

		// Verificar lat !== null
		if (itinerary.lat === null || itinerary.lat === undefined) {
			missingFields.push('lat');
		}

		// Verificar lng !== null
		if (itinerary.lng === null || itinerary.lng === undefined) {
			missingFields.push('lng');
		}

		// Si hay campos faltantes, lanzar excepción
		if (missingFields.length > 0) {
			this.logger.warn(`Itinerary ${itinerary.id} missing fields: ${missingFields.join(', ')}`);

			throw new BadRequestException({
				message: 'El itinerario no está completamente configurado',
				details: {
					missing_fields: missingFields,
					code: GenerationConstants.ERROR_CODES.ITINERARY_NOT_CONFIGURED,
					type: GenerationConstants.ERROR_TYPES.VALIDATION_ERROR
				}
			});
		}

		this.logger.log(`Itinerary ${itinerary.id} is properly configured`);
	}

	/**
	 * Valida la coherencia y validez de todos los parámetros del itinerario
	 */
	validateParameters(itinerary: any): void {
		this.logger.log(`Validating parameters for itinerary ${itinerary.id}`);

		const errors: string[] = [];

		// === VALIDAR TIEMPOS ===
		try {
			// Parsear start_time y end_time a objetos Date para validación
			if (itinerary.start_time && itinerary.end_time) {
				// Validar formato primero
				if (!TimeUtils.isValidTimeFormat(itinerary.start_time)) {
					errors.push('start_time debe estar en formato HH:MM válido');
				}

				if (!TimeUtils.isValidTimeFormat(itinerary.end_time)) {
					errors.push('end_time debe estar en formato HH:MM válido');
				}

				// Si los formatos son válidos, validar orden temporal y duración
				if (TimeUtils.isValidTimeFormat(itinerary.start_time) &&
					TimeUtils.isValidTimeFormat(itinerary.end_time)) {

					const durationMinutes = TimeUtils.calculateMinutesDifference(
						itinerary.start_time,
						itinerary.end_time
					);

					// Verificar que end_time > start_time
					if (durationMinutes <= 0) {
						errors.push('end_time debe ser posterior a start_time');
					}

					// Verificar diferencia >= 180 minutos (3 horas)
					else if (durationMinutes < GenerationConstants.MIN_ITINERARY_DURATION) {
						errors.push('La ventana de tiempo debe ser de al menos 3 horas');
					}
				}
			}
		} catch (error) {
			errors.push(`Error validando tiempos: ${error.message}`);
		}

		// === VALIDAR PRESUPUESTO ===
		try {
			// Verificar que budget > 0
			if (itinerary.budget !== null && itinerary.budget !== undefined) {
				// Verificar que budget es un número válido
				const budgetNumber = Number(itinerary.budget);
				if (isNaN(budgetNumber)) {
					errors.push('El presupuesto debe ser un número válido');
				} else if (budgetNumber <= 0) {
					errors.push('El presupuesto debe ser mayor a 0');
				}
			}
		} catch (error) {
			errors.push(`Error validando presupuesto: ${error.message}`);
		}

		// === VALIDAR COORDENADAS ===
		try {
			// Verificar que lat está entre -90 y 90
			if (itinerary.lat !== null && itinerary.lat !== undefined) {
				const lat = Number(itinerary.lat);
				if (isNaN(lat) || !this.isValidLatitude(lat)) {
					errors.push('Las coordenadas de latitud no son válidas (debe estar entre -90 y 90)');
				}
			}

			// Verificar que lng está entre -180 y 180
			if (itinerary.lng !== null && itinerary.lng !== undefined) {
				const lng = Number(itinerary.lng);
				if (isNaN(lng) || !this.isValidLongitude(lng)) {
					errors.push('Las coordenadas de longitud no son válidas (debe estar entre -180 y 180)');
				}
			}
		} catch (error) {
			errors.push(`Error validando coordenadas: ${error.message}`);
		}

		// === VALIDAR EXPERIENCE_TYPE_IDS ===
		try {
			if (itinerary.experience_type_ids) {
				// Verificar que no está vacío
				const trimmedIds = itinerary.experience_type_ids.trim();
				if (trimmedIds === '') {
					errors.push('Debe seleccionar al menos un tipo de experiencia');
				} else {
					// Split por coma y verificar que hay al menos 1 ID
					const idsArray = trimmedIds.split(',');
					if (idsArray.length === 0) {
						errors.push('Debe seleccionar al menos un tipo de experiencia');
					} else {
						// Verificar que cada ID no está vacío después de trim
						const validIds = idsArray.map(id => id.trim()).filter(id => id !== '');
						if (validIds.length === 0) {
							errors.push('Debe seleccionar al menos un tipo de experiencia válido');
						} else if (validIds.length !== idsArray.length) {
							errors.push('Algunos tipos de experiencia tienen formato inválido');
						}
					}
				}
			}
		} catch (error) {
			errors.push(`Error validando tipos de experiencia: ${error.message}`);
		}

		// Si hay errores, lanzar excepción con todos los detalles
		if (errors.length > 0) {
			this.logger.warn(`Itinerary ${itinerary.id} parameter validation failed: ${errors.join('; ')}`);

			throw new BadRequestException({
				message: 'Parámetros del itinerario inválidos',
				details: {
					validation_errors: errors,
					code: GenerationConstants.ERROR_CODES.INVALID_PARAMETERS,
					type: GenerationConstants.ERROR_TYPES.VALIDATION_ERROR
				}
			});
		}

		this.logger.log(`Itinerary ${itinerary.id} parameters are valid`);
	}

	/**
	 * Valida que la fecha del itinerario esté dentro del rango del trip
	 */
	validateDateInTripRange(itinerary: any, trip: any): void {
		this.logger.log(`Validating date range for itinerary ${itinerary.id} in trip ${trip.id}`);

		try {
			// Extraer fechas
			const itineraryDate = new Date(itinerary.date);
			const tripStartDate = new Date(trip.start_date);
			const tripEndDate = new Date(trip.end_date);

			// Validar que las fechas son válidas
			if (isNaN(itineraryDate.getTime())) {
				throw new BadRequestException({
					message: 'La fecha del itinerario no es válida',
					details: {
						invalid_date: itinerary.date,
						code: GenerationConstants.ERROR_CODES.INVALID_PARAMETERS,
						type: GenerationConstants.ERROR_TYPES.VALIDATION_ERROR
					}
				});
			}

			if (isNaN(tripStartDate.getTime()) || isNaN(tripEndDate.getTime())) {
				throw new BadRequestException({
					message: 'Las fechas del viaje no son válidas',
					details: {
						trip_start_date: trip.start_date,
						trip_end_date: trip.end_date,
						code: GenerationConstants.ERROR_CODES.INVALID_PARAMETERS,
						type: GenerationConstants.ERROR_TYPES.VALIDATION_ERROR
					}
				});
			}

			// Normalizar fechas a solo la parte de fecha (sin hora) para comparación
			const itineraryDateOnly = new Date(itineraryDate.getFullYear(), itineraryDate.getMonth(), itineraryDate.getDate());
			const tripStartDateOnly = new Date(tripStartDate.getFullYear(), tripStartDate.getMonth(), tripStartDate.getDate());
			const tripEndDateOnly = new Date(tripEndDate.getFullYear(), tripEndDate.getMonth(), tripEndDate.getDate());

			// Verificar que itinerary.date >= trip.start_date
			if (itineraryDateOnly < tripStartDateOnly) {
				this.logger.warn(
					`Itinerary date ${itineraryDateOnly.toISOString().split('T')[0]} is before trip start ${tripStartDateOnly.toISOString().split('T')[0]}`
				);

				throw new BadRequestException({
					message: 'La fecha del itinerario debe estar dentro del rango del viaje',
					details: {
						itinerary_date: itineraryDateOnly.toISOString().split('T')[0],
						trip_start_date: tripStartDateOnly.toISOString().split('T')[0],
						trip_end_date: tripEndDateOnly.toISOString().split('T')[0],
						error: 'La fecha del itinerario es anterior al inicio del viaje',
						code: GenerationConstants.ERROR_CODES.INVALID_PARAMETERS,
						type: GenerationConstants.ERROR_TYPES.VALIDATION_ERROR
					}
				});
			}

			// Verificar que itinerary.date <= trip.end_date
			if (itineraryDateOnly > tripEndDateOnly) {
				this.logger.warn(
					`Itinerary date ${itineraryDateOnly.toISOString().split('T')[0]} is after trip end ${tripEndDateOnly.toISOString().split('T')[0]}`
				);

				throw new BadRequestException({
					message: 'La fecha del itinerario debe estar dentro del rango del viaje',
					details: {
						itinerary_date: itineraryDateOnly.toISOString().split('T')[0],
						trip_start_date: tripStartDateOnly.toISOString().split('T')[0],
						trip_end_date: tripEndDateOnly.toISOString().split('T')[0],
						error: 'La fecha del itinerario es posterior al final del viaje',
						code: GenerationConstants.ERROR_CODES.INVALID_PARAMETERS,
						type: GenerationConstants.ERROR_TYPES.VALIDATION_ERROR
					}
				});
			}

			this.logger.log(`Itinerary ${itinerary.id} date is within trip ${trip.id} range`);

		} catch (error) {
			// Si ya es una BadRequestException, la re-lanzamos
			if (error instanceof BadRequestException) {
				throw error;
			}

			// Para otros errores, crear una nueva excepción
			this.logger.error(`Error validating date range: ${error.message}`);
			throw new BadRequestException({
				message: 'Error validando el rango de fechas',
				details: {
					error: error.message,
					code: GenerationConstants.ERROR_CODES.INVALID_PARAMETERS,
					type: GenerationConstants.ERROR_TYPES.VALIDATION_ERROR
				}
			});
		}
	}

	/**
	 * Valida que una latitud esté en el rango válido
	 */
	private isValidLatitude(lat: number): boolean {
		return lat >= -90 && lat <= 90;
	}

	/**
	 * Valida que una longitud esté en el rango válido
	 */
	private isValidLongitude(lng: number): boolean {
		return lng >= -180 && lng <= 180;
	}
}
