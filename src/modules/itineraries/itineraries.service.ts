import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Itinerary } from '../../database/models/itinerary.model';
import { Activity } from '../../database/models/activity.model';
import { Op, WhereOptions } from 'sequelize';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { ItineraryAttributes } from '../../database/models/itinerary.model';
import { ActivityAttributes } from '../activity/entities/activity.interface';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { Logger } from '@nestjs/common';
@Injectable()
export class ItinerariesService {
	private readonly logger = new Logger(ItinerariesService.name);
	constructor(
		@InjectModel(Itinerary)
		private readonly itineraryModel: typeof Itinerary,

		@InjectModel(Activity)
		private readonly activityModel: typeof Activity
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
		createItineraryDto: CreateItineraryDto
	): Promise<Itinerary> {
		try {
			const itinerary =
				await this.itineraryModel.create(createItineraryDto);
			return itinerary;
		} catch (error) {
			console.error('Error creating itinerary:', error);
			throw error;
		}
	}

	// Hacer update al itinerary
	async getItinerariesByTripId(tripId: number): Promise<any[]> {
		try {
			const whereClause: WhereOptions<ItineraryAttributes> = {
				trip_id: tripId,
				deleted_at: { [Op.is]: null },
			};

			const itineraries = await this.itineraryModel.findAll({
				where: whereClause,
				include: [
					{
						model: Activity,
						as: 'activities',
						attributes: [
							'id',
							'description',
							'time',
							'location',
							'budget',
							'transportation_mode',
							'img_url',
							'day',
						],
						order: [['time', 'ASC']],
						required: false,
						where: {
							deleted_at: { [Op.is]: null },
						} as WhereOptions<ActivityAttributes>,
					},
				],
				order: [['date', 'ASC']],
			});

			console.log('Found itineraries:', itineraries.length);

			if (!itineraries || itineraries.length === 0) {
				throw new NotFoundException(
					`No itineraries found for trip ID ${tripId}`
				);
			}

			// Procesar cada itinerario
			return itineraries.map(itinerary => {
				const itineraryData = itinerary.toJSON();
				const activities = itineraryData.activities || [];

				// Convertimos las actividades a un array plano sin agrupar por "Day X"
				const flatActivities = activities.map(activity => ({
					id: activity.id,
					description: activity.description,
					time: activity.time,
					location: activity.location,
					budget: activity.budget,
					transportation: activity.transportation_mode,
					image: activity.img_url,
				}));

				return {
					id: itinerary.id,
					trip_id: itinerary.trip_id,
					date: itinerary.date,
					start_time: itinerary.start_time,
					end_time: itinerary.end_time,
					budget: itinerary.budget,
					experience_types: itinerary.experience_types,
					activities: flatActivities, // ahora es un array plano
				};
			});
		} catch (error) {
			console.error('Error in getItinerariesByTripId:', error);
			throw error;
		}
	}

	async getItineraryWithActivities(itineraryId: number): Promise<any> {
		try {
			const whereClause: WhereOptions<ItineraryAttributes> = {
				id: itineraryId,
				deleted_at: { [Op.is]: null },
			};

			const itinerary = await this.itineraryModel.findOne({
				where: whereClause,
				include: [
					{
						model: Activity,
						as: 'activities',
						attributes: [
							'id',
							'description',
							'time',
							'location',
							'budget',
							'transportation_mode',
							'img_url',
							'day',
						],
						order: [['time', 'ASC']],
						required: false,
						where: {
							deleted_at: { [Op.is]: null },
						} as WhereOptions<ActivityAttributes>,
					},
				],
			});

			console.log(
				'Itinerary raw data:',
				JSON.stringify(itinerary, null, 2)
			);

			if (!itinerary) {
				throw new NotFoundException(
					`Itinerary with ID ${itineraryId} not found`
				);
			}

			const itineraryData = itinerary.toJSON();
			const activities = itineraryData.activities || [];

			const groupedActivities = activities.reduce((acc, activity) => {
				const dayKey =  activity.time
						? new Date(activity.time).toISOString().split('T')[0]
						: 'Unspecified Day';

				if (!acc[dayKey]) acc[dayKey] = [];
				acc[dayKey].push({
					id: activity.id,
					description: activity.description,
					time: activity.time,
					location: activity.location,
					budget: activity.budget,
					transportation: activity.transportation_mode,
					image: activity.img_url,
				});
				return acc;
			}, {});

			return {
				id: itinerary.id,
				trip_id: itinerary.trip_id,
				date: itinerary.date,
				start_time: itinerary.start_time,
				end_time: itinerary.end_time,
				budget: itinerary.budget,
				activities: groupedActivities,
			};
		} catch (error) {
			console.error('Error in getItineraryWithActivities:', error);
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
}
