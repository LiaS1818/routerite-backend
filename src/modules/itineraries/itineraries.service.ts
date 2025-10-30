import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Itinerary, Activity, Trip, User } from '../../database/models';
import { Op, WhereOptions } from 'sequelize';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { Logger } from '@nestjs/common';
import { TripAccessValidatorService } from '../../common/services/trip-access-validator.service';
import { ExperienceTypeDto } from './dto/experience_type.dto';
import { ReorderActivitiesDto } from './dto/reorder-activities.dto';
import { OptimizerClientService } from '../optimizer/optimizer-client.service';
import { ActivityOptimizationPayload, ActivityToOptimize } from '../optimizer/dto/activity-optimization-payload.dto';
import { ActivityOptimizationResponse } from '../optimizer/dto/activity-optimization-response.dto';
import { calculateMinutesDifference } from '../../shared/utils/time.utils';

@Injectable()
export class ItinerariesService {
	private readonly logger = new Logger(ItinerariesService.name);

	constructor(
		@InjectModel(Itinerary)
		private readonly itineraryModel: typeof Itinerary,
		@InjectModel(Activity)
		private readonly activityModel: typeof Activity,
		private readonly tripAccessValidator: TripAccessValidatorService,
		private readonly optimizerClientService: OptimizerClientService
	) {}

	async create(createItineraryDto: CreateItineraryDto): Promise<void> {
		this.logger.debug('DTO recibido:');
		this.logger.debug(JSON.stringify(createItineraryDto, null, 2));

		this.logger.debug('Tipos de datos:');
		Object.entries(createItineraryDto).forEach(([key, value]) => {
			this.logger.debug(`${key}: ${value} (${typeof value})`);
		});
	}

	async createItinerary(
		createItineraryDto: CreateItineraryDto,
		userId?: number
	): Promise<Itinerary> {
		try {
			// Validate ownership for creation using trip_id directly
			if (userId) {
				await this.tripAccessValidator.validateTripOwnership(
					createItineraryDto.trip_id,
					userId
				);
			}

			// Ensure experience_types is included as required by the model
			const experience_types =
				(createItineraryDto as any).experience_types ?? '';
			return await this.itineraryModel.create({
				...createItineraryDto,
				experience_types,
			});
		} catch (error) {
			console.error('Error creating itinerary:', error);
			throw error;
		}
	}

	// Get itineraries by trip ID with access validation
	async getItinerariesByTripId(
		tripId: number,
		userId?: number
	): Promise<any[]> {
		try {
			// Validate access to trip
			if (userId) {
				await this.tripAccessValidator.validateTripAccess(
					tripId,
					userId
				);
			}

			const itineraries = await this.itineraryModel.findAll({
				where: {
					trip_id: tripId,
					deleted_at: { [Op.is]: null },
				},
				include: [
					{
						model: Activity,
						as: 'activities',
						where: {
							deleted_at: { [Op.is]: null },
						},
						required: false,
					},
				],
				order: [
					['date', 'ASC'],
					[
						{ model: Activity, as: 'activities' },
						'sequence',
						'ASC',
					],
				],
			});

			return itineraries;
		} catch (error) {
			console.error('Error fetching itineraries:', error);
			throw error;
		}
	}

	// Get specific itinerary with activities and access validation
	async getItineraryWithActivities(
		id: number,
		userId?: number
	): Promise<Itinerary> {
		try {
			const itinerary = await this.itineraryModel.findOne({
				where: { id, deleted_at: { [Op.is]: null } },
				include: [
					{
						model: Activity,
						as: 'activities',
						where: { deleted_at: { [Op.is]: null } },
						required: false,
					},
				],
				order: [[{ model: Activity, as: 'activities' }, 'sequence', 'ASC']],
			});

			if (!itinerary) {
				throw new NotFoundException('Itinerary not found');
			}

			// Validate access to the trip through itinerary
			if (userId) {
				await this.tripAccessValidator.validateTripAccessThroughItinerary(
					id,
					userId
				);
			}

			return itinerary;
		} catch (error) {
			console.error('Error fetching itinerary:', error);
			throw error;
		}
	}

	// Método adicional para encontrar un itinerario por ID
	async findOne(id: number): Promise<Itinerary> {
		const itinerary = await this.itineraryModel.findByPk(id);
		if (!itinerary) {
			throw new NotFoundException(`Itinerary with ID ${id} not found`);
		}
		return itinerary;
	}

	// Método para eliminar itinerario
	async remove(id: number): Promise<void> {
		const itinerary = await this.findOne(id);
		await itinerary.destroy();
	}

	// Método para actualizar un itinerario
	async updateItinerary(
		id: number,
		updateItineraryDto: UpdateItineraryDto
	): Promise<Itinerary> {
		// Buscar el itinerario en la base de datos
		const itinerary = await this.itineraryModel.findOne({
			where: { id },
		});

		// Si no se encuentra el itinerario, lanzamos una excepción
		if (!itinerary) {
			throw new NotFoundException(`Itinerary with ID ${id} not found`);
		}

		// Actualizar los campos del itinerario con los valores del DTO
		if (updateItineraryDto.start_time != "" && updateItineraryDto.start_time != undefined)
			itinerary.start_time = updateItineraryDto.start_time;
		if (updateItineraryDto.end_time != "" && updateItineraryDto.end_time != undefined)
			itinerary.end_time = updateItineraryDto.end_time;
		if (updateItineraryDto.budget !== null && updateItineraryDto.budget !== undefined)
			itinerary.budget = updateItineraryDto.budget;
		if (updateItineraryDto.lat !== undefined)
			itinerary.lat = updateItineraryDto.lat;
		if (updateItineraryDto.lng !== undefined)
			itinerary.lng = updateItineraryDto.lng;
		if (updateItineraryDto.experience_type_ids)
			itinerary.experience_type_ids =
				updateItineraryDto.experience_type_ids.join(',');
		if(updateItineraryDto.starting_location && updateItineraryDto.starting_location.name != "" && updateItineraryDto.starting_location.name != undefined)
			itinerary.starting_location = updateItineraryDto.starting_location;

		// Guardar los cambios en el itinerario
		await itinerary.save();

		// Retornar el itinerario actualizado
		return itinerary;
	}

	async reorderActivities(itineraryId: number, reorderActivitiesDto: ReorderActivitiesDto, userId: number) {
		// Validar acceso del usuario al itinerario
		await this.tripAccessValidator.validateTripOwnershipThroughItinerary(itineraryId, userId);

		const { activities, deletedActivities } = reorderActivitiesDto;
		if (!activities || activities.length === 0) {
			throw new BadRequestException('La lista de actividades no puede estar vacía');
		}

		// Validar que las secuencias sean consecutivas y sin duplicados
		const sequences = activities.map(a => a.sequence).sort((a, b) => a - b);
		for (let i = 0; i < sequences.length; i++) {
			if (sequences[i] !== i) {
				throw new BadRequestException('Las secuencias deben ser consecutivas y empezar en 1, sin duplicados');
			}
		}

		// Validar que todas las actividades pertenezcan al itinerario
		const activityIds = activities.map(a => a.id);
		const dbActivities = await this.activityModel.findAll({
			where: { id: activityIds, itinerary_id: itineraryId }
		});
		if (dbActivities.length !== activities.length) {
			throw new BadRequestException('Algunas actividades no pertenecen al itinerario');
		}

		// Actualizar secuencias
		const updatePromises = activities.map(({ id, sequence, start_time, end_time }) =>
			this.activityModel.update({ sequence, start_time, end_time }, { where: { id } })
		);
		await Promise.all(updatePromises);

		// Borrar las actividades eliminadas
		await this.activityModel.destroy({ where: { id: deletedActivities } });
		return { success: true };
	}

	async optimizeActivities(itineraryId: number, userId: number): Promise<ActivityOptimizationResponse> {
		// Validar acceso del usuario al itinerario
		await this.tripAccessValidator.validateTripOwnershipThroughItinerary(itineraryId, userId);

		// Obtener itinerario con sus actividades
		const itinerary = await this.getItineraryWithActivities(itineraryId, userId);

		if (!itinerary.activities || itinerary.activities.length < 2) {
			throw new BadRequestException('El itinerario debe tener al menos 2 actividades para optimizar');
		}

		// Validar que el itinerario esté configurado
		if (!itinerary.start_time || !itinerary.end_time || !itinerary.budget) {
			throw new BadRequestException('El itinerario debe tener configurado start_time, end_time y budget');
		}

		// Construir el payload para el optimizer
		const activities: ActivityToOptimize[] = itinerary.activities.map((activity) => ({
			id: activity.id,
			name: activity.name,
			description: activity.description,
			location: {
				lat: activity.lat,
				lng: activity.lng,
			},
			category: {
				id: activity.place?.categories?.[0]?.fsq_category_id || 'unknown',
				name: activity.place?.categories?.[0]?.name || 'Unknown',
			},
			estimated_duration: calculateMinutesDifference(activity.start_time, activity.end_time),
			estimated_cost: activity.budget,
			rating: activity.place?.rating || null,
			current_sequence: activity.sequence,
			place_data: activity.place,
		}));

		// Calcular ventana de tiempo
		const [startHour, startMinute] = itinerary.start_time.split(':').map(Number);
		const [endHour, endMinute] = itinerary.end_time.split(':').map(Number);
		const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

		const payload: ActivityOptimizationPayload = {
			itinerary: {
				id: itinerary.id,
				date: itinerary.date.toISOString().split('T')[0],
				origin: {
					lat: itinerary.lat,
					lng: itinerary.lng,
				},
				time_window: {
					start: itinerary.start_time,
					end: itinerary.end_time,
					total_minutes: totalMinutes,
				},
				budget: {
					total: itinerary.budget,
					avg_per_activity: itinerary.budget / itinerary.activities.length,
				},
			},
			activities: activities,
			options: {
				preserve_order: false,
				minimize_travel_time: true,
				balance_timing: true,
			},
			metadata: {
				request_id: '', // Se generará en el optimizer-client
				timestamp: new Date().toISOString(),
			},
		};

		// Llamar al optimizer
		const result = await this.optimizerClientService.optimizeActivities(payload);

		// Si fue exitoso, actualizar las actividades en la base de datos
		if (result.success) {
			const updatePromises = result.optimized_activities.map((optimizedActivity) =>
				this.activityModel.update(
					{
						sequence: optimizedActivity.sequence,
						start_time: optimizedActivity.timing.start_time,
						end_time: optimizedActivity.timing.end_time,
						transportation_duration: optimizedActivity.timing.travel_time_from_previous,
						distance_to_start: optimizedActivity.timing.travel_distance_from_previous,
					},
					{ where: { id: optimizedActivity.id } }
				)
			);

			await Promise.all(updatePromises);

			this.logger.log(`Activities optimized for itinerary ${itineraryId}`);
		}

		return result;
	}
}
