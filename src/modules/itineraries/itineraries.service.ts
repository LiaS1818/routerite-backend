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

@Injectable()
export class ItinerariesService {
	private readonly logger = new Logger(ItinerariesService.name);

	constructor(
		@InjectModel(Itinerary)
		private readonly itineraryModel: typeof Itinerary,
		@InjectModel(Activity)
		private readonly activityModel: typeof Activity,
		private readonly tripAccessValidator: TripAccessValidatorService
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
						'created_at',
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

		const { activities } = reorderActivitiesDto;
		if (!activities || activities.length === 0) {
			throw new BadRequestException('La lista de actividades no puede estar vacía');
		}

		// Validar que las secuencias sean consecutivas y sin duplicados
		const sequences = activities.map(a => a.sequence).sort((a, b) => a - b);
		for (let i = 0; i < sequences.length; i++) {
			if (sequences[i] !== i + 1) {
				throw new BadRequestException('Las secuencias deben ser consecutivas y empezar en 1, sin duplicados');
			}
		}

		// Validar que todas las actividades pertenezcan al itinerario
		const activityIds = activities.map(a => a.activity_id);
		const dbActivities = await this.activityModel.findAll({
			where: { id: activityIds, itinerary_id: itineraryId }
		});
		if (dbActivities.length !== activities.length) {
			throw new BadRequestException('Algunas actividades no pertenecen al itinerario');
		}

		// Actualizar secuencias
		const updatePromises = activities.map(({ activity_id, sequence }) =>
			this.activityModel.update({ sequence }, { where: { id: activity_id } })
		);
		await Promise.all(updatePromises);
		return { success: true };
	}
}
