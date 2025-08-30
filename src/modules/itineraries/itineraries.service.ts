import {
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Itinerary, Activity, Trip, User } from '../../database/models';
import { Op, WhereOptions } from 'sequelize';
import { ActivityAttributes } from '../activity/entities/activity.interface';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { Logger } from '@nestjs/common';
import { TripAccessValidatorService } from '../../common/services/trip-access-validator.service';

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

			return await this.itineraryModel.create(createItineraryDto);
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
						attributes: [
							'id',
							'itinerary_id',
							'time',
							'name',
							'description',
							'location',
							'created_at',
							'updated_at',
						],
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

	async updateItinerary(
		id: number,
		updateData: UpdateItineraryDto
	): Promise<Itinerary> {
		const itinerary = await this.findOne(id);
		return itinerary.update(updateData);
	}
}
