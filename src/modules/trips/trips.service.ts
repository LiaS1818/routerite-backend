import {
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Op, Transaction, FindOptions } from 'sequelize';
import { Trip } from '../../database/models';
import { User } from '../../database/models';

@Injectable()
export class TripsService {
	private readonly logger = new Logger(TripsService.name); 

	constructor(
		@InjectModel(Trip)
		private readonly tripModel: typeof Trip,
		@InjectModel(User)
		private readonly userModel: typeof User,
		private readonly configService: ConfigService
	) {}

	/**
	 * Create a new trip in the database
	 */
	async create(
		createData: Partial<Trip>,
		transaction?: Transaction
	): Promise<Trip> {
		try {
			this.logger.log(
				`Creating new trip for user ${createData.user_id}`
			);

			const trip = await this.tripModel.create(createData as any, {
				transaction,
				include: [
					{
						model: this.userModel,
						as: 'user',
						attributes: ['id', 'name', 'email'],
					},
				],
			});

			this.logger.log(`Trip created successfully with ID: ${trip.id}`);
			return trip;
		} catch (error) {
			this.logger.error(
				`Error creating trip: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Get all trips for a user
	 */
	async findByUserId(
		userId: number,
		options: FindOptions = {}
	): Promise<Trip[]> {
		try {
			this.logger.log(`Getting trips for user ${userId}`);

			const defaultOptions: FindOptions = {
				where: { user_id: userId },
				order: [['start_date', 'DESC']],
				paranoid: true
			};

			const trips = await this.tripModel.findAll({
				...defaultOptions,
				...options,
			});

			this.logger.log(
				`Found ${trips.length} trips for user ${userId}`
			);
			return trips;
		} catch (error) {
			this.logger.error(
				`Error getting trips for user ${userId}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Find a trip by ID and user ID
	 */
	async findByIdAndUser(
		id: number,
		userId: number
	): Promise<Trip | null> {
		try {
			this.logger.log(`Finding trip with ID ${id} for user ${userId}`);

			const trip = await this.tripModel.findOne({
				where: {
					id,
					user_id: userId,
				},
			});

			if (!trip) {
				this.logger.warn(
					`Trip with ID ${id} not found for user ${userId}`
				);
				return null;
			}
			return trip;
		} catch (error) {
			this.logger.error(
				`Error finding trip ${id} for user ${userId}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Find trips by date range for a user (for overlap validation)
	 */
	async findByDateRange(
		userId: number,
		startDate: Date,
		endDate: Date,
		excludeId?: number
	): Promise<Trip[]> {
		const whereClause: any = {
			user_id: userId,
			[Op.or]: [
				{
					// Case 1: Trip starts during another trip
					start_date: {
						[Op.between]: [startDate, endDate],
					},
				},
				{
					// Case 2: Trip ends during another trip
					end_date: {
						[Op.between]: [startDate, endDate],
					},
				},
				{
					// Case 3: Trip completely contains another trip
					[Op.and]: [
						{ start_date: { [Op.lte]: startDate } },
						{ end_date: { [Op.gte]: endDate } },
					],
				},
			],
		};

		// Exclude current trip if updating
		if (excludeId) {
			whereClause.id = { [Op.ne]: excludeId };
		}

		return this.tripModel.findAll({
			where: whereClause,
		});
	}

	/**
	 * Find upcoming trips for a user
	 */
	async findUpcomingByUser(userId: number): Promise<Trip[]> {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			return this.tripModel.findAll({
				where: {
					user_id: userId,
					start_date: {
						[Op.gte]: today,
					},
					status: {
						[Op.in]: ['planned', 'active'],
					},
				},
				order: [['start_date', 'ASC']],
				limit: 5,
			});
		} catch (error) {
			this.logger.error(
				`Error finding upcoming trips for user ${userId}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Update a trip
	 */
	async update(
		id: number,
		updateData: Partial<Trip>
	): Promise<Trip> {
		try {
			this.logger.log(`Updating trip with ID ${id}`);

			const trip = await this.tripModel.findByPk(id);

			if (!trip) {
				throw new NotFoundException(`Trip with ID ${id} not found`);
			}

			await trip.update(updateData);

			this.logger.log(`Trip with ID ${id} updated successfully`);
			return trip.reload({
				include: [
					{
						model: this.userModel,
						as: 'user',
						attributes: ['id', 'name', 'email'],
					},
				],
			});
		} catch (error) {
			this.logger.error(
				`Error updating trip ${id}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Remove a trip (soft delete)
	 */
	async remove(id: number): Promise<{ success: boolean }> {
		try {
			this.logger.log(`Removing trip with ID ${id}`);

			const trip = await this.tripModel.findByPk(id);

			if (!trip) {
				throw new NotFoundException(`Trip with ID ${id} not found`);
			}

			await trip.destroy();

			this.logger.log(`Trip with ID ${id} removed successfully`);
			return { success: true };
		} catch (error) {
			this.logger.error(
				`Error removing trip ${id}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}
}