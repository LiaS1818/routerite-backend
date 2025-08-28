import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Itinerary, Activity } from '../../database/models';
import { Op, WhereOptions } from 'sequelize';
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
			return await this.itineraryModel.create(createItineraryDto);
		} catch (error) {
			console.error('Error creating itinerary:', error);
			throw error;
		}
	}

	// Hacer update al itinerary
	async getItinerariesByTripId(tripId: number): Promise<any[]> {
		try {
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
							'name',
							'description',
							'time',
							'lat',
							'lng',
							'category_name',
							'category_fsqr_id',
							'distance_to_start',
							'budget',
							'price',
							'location',
							'transportation_mode',
							'img_url',
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

			return itineraries;
		} catch (error) {
			console.error('Error in getItinerariesByTripId:', error);
			throw error;
		}
	}

	async getItineraryWithActivities(itineraryId: number): Promise<any> {
		try {
			const whereClause = {
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
							'name',
							'description',
							'time',
							'lat',
							'lng',
							'category_name',
							'category_fsqr_id',
							'distance_to_start',
							'budget',
							'price',
							'location',
							'transportation_mode',
							'img_url',
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
				const dayKey = activity.time
					? new Date(activity.time).toISOString().split('T')[0]
					: 'Unspecified Day';

				if (!acc[dayKey]) acc[dayKey] = [];
				acc[dayKey].push({
					id: activity.id,
					name: activity.name,
					description: activity.description,
					time: activity.time,
					location: activity.location,
					lat: activity.lat,
					lng: activity.lng,
					category_name: activity.category_name,
					category_fsqr_id: activity.category_fsqr_id,
					distance_to_start: activity.distance_to_start,
					budget: activity.budget,
					price: activity.price,
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
