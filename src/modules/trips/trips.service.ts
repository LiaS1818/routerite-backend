import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction, FindOptions } from 'sequelize';
import { Itinerary, Trip, User, TripInvitation } from '../../database/models';
import {
	ItineraryAttributes,
	ItineraryCreationAttributes,
} from '../../database/models/itinerary.model';
import { UpdateTripExtendedDto } from './dto';
import { TripAccessValidatorService } from '../../common/services/trip-access-validator.service';

@Injectable()
export class TripsService {
	private readonly logger = new Logger(TripsService.name);

	constructor(
		@InjectModel(Trip)
		private readonly tripModel: typeof Trip,
		@InjectModel(User)
		private readonly userModel: typeof User,
		@InjectModel(Itinerary)
		private readonly itineraryModel: typeof Itinerary,
		private readonly tripAccessValidator: TripAccessValidatorService
	) {}

	/**
	 * Create a new trip in the database
	 */
	async create(
		createData: Partial<Trip>,
		transaction?: Transaction
	): Promise<Trip> {
		try {
			this.logger.log(`Creating new trip for user ${createData.user_id}`);

			const trip = await this.tripModel.create(createData as any, {
				transaction,
			});

			// Create trip itineraries
			const tripDuration = Math.ceil(
				(trip.end_date.getTime() - trip.start_date.getTime()) /
					(1000 * 60 * 60 * 24)
			);
			console.log('Trip duration: ', tripDuration);
			for (let i = 0; i < tripDuration; i++) {
				const itinerary: ItineraryCreationAttributes = {
					trip_id: trip.id,
					date: new Date(
						trip.start_date.getTime() + i * 24 * 60 * 60 * 1000
					),
					start_time: null,
					end_time: null,
					lat: parseFloat(trip.lat), // Convert string to number
					lng: parseFloat(trip.lng), // Convert string to number
					budget: trip.total_budget / tripDuration,
					experience_type_ids: '',
					experience_types: '',
				};
				await this.itineraryModel.create(itinerary, { transaction });
				this.logger.log(`Itinerary created for trip ${trip.id}`);
			}
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
	 * Get all trips for a user (both owned and invited)
	 */
	async findAllByUserId(
		userId: number,
		options: FindOptions = {}
	): Promise<Trip[]> {
		try {
			this.logger.log(`Getting trips for user ${userId}`);

			// Get trips where user is owner
			const ownedTrips = await this.tripModel.findAll({
				where: { user_id: userId },
				order: [['start_date', 'DESC']],
				paranoid: true,
				...options,
			});

			// Get trips where user is accepted guest
			const invitedTrips = await this.tripModel.findAll({
				include: [
					{
						model: User,
						as: 'guests',
						where: { id: userId },
						through: {
							where: { status: 'accepted' },
							attributes: [],
						},
						attributes: [],
					},
				],
				order: [['start_date', 'DESC']],
				...options,
			});

			// Combine and deduplicate trips
			const allTrips = [...ownedTrips, ...invitedTrips];
			const uniqueTrips = allTrips.filter(
				(trip, index, self) =>
					index === self.findIndex(t => t.id === trip.id)
			);

			this.logger.log(
				`Found ${uniqueTrips.length} trips for user ${userId} (${ownedTrips.length} owned, ${invitedTrips.length} invited)`
			);
			return uniqueTrips.sort(
				(a, b) =>
					new Date(a.start_date).getTime() -
					new Date(b.start_date).getTime()
			);
		} catch (error) {
			this.logger.error(
				`Error getting trips for user ${userId}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Find a trip by ID with access validation (owner or accepted guest)
	 */
	async findByIdWithAccess(id: number, userId: number): Promise<Trip | null> {
		try {
			this.logger.log(
				`Finding trip with ID ${id} with access validation for user ${userId}`
			);

			// Validate access first
			await this.tripAccessValidator.validateTripAccess(id, userId);

			const trip = await this.tripModel.findOne({
				where: { id },
				include: [
					{
						model: User,
						as: 'guests',
						attributes: ['id', 'name', 'email', 'profile_picture'],
						through: {
							where: {
								status: {
									[Op.or]: ['pending', 'accepted'],
								},
							},
							attributes: ['status'],
						},
					},
					{
						model: User,
						as: 'owner',
						attributes: ['id', 'name', 'email'],
					},
				],
			});

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
	 * Find a trip by ID and user ID (only for owners - for administrative operations)
	 */
	async findByIdAndUser(id: number, userId: number): Promise<Trip | null> {
		try {
			this.logger.log(`Finding trip with ID ${id} for user ${userId}`);

			const trip = await this.tripModel.findOne({
				where: {
					id,
					user_id: userId,
				},
				include: [
					{
						model: this.userModel,
						as: 'guests',
						attributes: ['id', 'name', 'email', 'profile_picture'],
						through: {
							where: { status: 'accepted' },
							attributes: [],
						},
					},
					{
						model: this.userModel,
						as: 'user',
						attributes: ['id', 'name', 'email'],
					},
				],
			});

			if (!trip) {
				this.logger.warn(
					`Trip with ID ${id} not found for user ${userId}`
				);
				throw new NotFoundException(`Trip with ID ${id} not found`);
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
		updateData: Partial<Trip>,
		transaction: Transaction
	): Promise<Trip> {
		try {
			this.logger.log(`Updating trip with ID ${id}`);

			const trip = await this.tripModel.findByPk(id, {
				transaction
			});

			if (!trip) {
				throw new NotFoundException(`Trip with ID ${id} not found`);
			}

			await trip.update(updateData, { transaction });

			this.logger.log(`Trip with ID ${id} updated successfully`);
			return trip.reload({
				include: [
					{
						model: this.userModel,
						as: 'owner',
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

	/**
	 * Update trip with itinerary management
	 */
	async updateTripWithItineraryManagement(
		userId: number,
		tripId: number,
		updateData: UpdateTripExtendedDto
	) {
		const transaction = await this.tripModel.sequelize!.transaction();
		const msPerDay = 1000 * 60 * 60 * 24;
		const normalizeDate = (d: Date) => {
			const nd = new Date(d);
			nd.setHours(0, 0, 0, 0);
			return nd;
		};
		const diffDays = (a: Date, b: Date) =>
			Math.round(
				(normalizeDate(a).getTime() - normalizeDate(b).getTime()) /
					msPerDay
			);

		const summary = {
			created: [] as any[],
			updated: [] as any[],
			deleted: [] as any[],
			warnings: [] as string[],
			budget_changes: {
				previous_total: null as null | number,
				new_total: null as null | number,
			},
		};

		try {
			// 1. Ownership + trip fetch
			const trip = await this.tripModel.findOne({
				where: { id: tripId, user_id: userId },
				transaction,
			});
			if (!trip) throw new NotFoundException('Trip not found');

			// 2. Status validations
			if (
				trip.status === 'completed' &&
				(updateData.start_date || updateData.end_date)
			) {
				throw new Error(
					'No se pueden modificar fechas de un viaje completado'
				);
			}
			if (trip.status === 'cancelled') {
				const { status, ...rest } = updateData as any;
				if (Object.keys(rest).length > 0) {
					throw new Error(
						'Solo se puede cambiar el status de un viaje cancelado'
					);
				}
			}

			// 3. Parse & detectar cambios reales de fechas
			const currentStart = normalizeDate(trip.start_date);
			const currentEnd = normalizeDate(trip.end_date);
			const requestedStart = updateData.start_date
				? normalizeDate(new Date(updateData.start_date))
				: currentStart;
			const requestedEnd = updateData.end_date
				? normalizeDate(new Date(updateData.end_date))
				: currentEnd;
			if (requestedEnd < requestedStart)
				throw new Error(
					'La fecha de fin no puede ser anterior a la fecha de inicio'
				);
			const changedStart =
				requestedStart.getTime() !== currentStart.getTime();
			const changedEnd = requestedEnd.getTime() !== currentEnd.getTime();
			const datesChanged = changedStart || changedEnd;

			// Active trip restriction
			const today = normalizeDate(new Date());
			if (
				trip.status === 'active' &&
				changedStart &&
				requestedStart < today
			) {
				throw new Error(
					'No se puede mover un viaje activo para iniciar en el pasado'
				);
			}

			// 4. Overlap validation si las fechas cambian
			if (datesChanged) {
				const overlapping = await this.findByDateRange(
					userId,
					requestedStart,
					requestedEnd,
					tripId
				);
				if (overlapping.length > 0) {
					throw new Error(
						'Las nuevas fechas se solapan con otros viajes'
					);
				}
			}

			// 5. Detectar cambios en otros campos
			const budgetChanged =
				updateData.total_budget !== undefined &&
				updateData.total_budget !== trip.total_budget;
			const travelersChanged =
				updateData.travelers_count !== undefined &&
				updateData.travelers_count !== trip.travelers_count;
			const statusChanged =
				updateData.status !== undefined &&
				updateData.status !== trip.status;

			// Si nada cambió, devolver estado actual sin tocar DB adicional (commit vacío)
			if (
				!datesChanged &&
				!budgetChanged &&
				!travelersChanged &&
				!statusChanged
			) {
				await transaction.commit();
				return {
					trip: trip.toJSON(),
					itineraries_summary: {
						created: [],
						updated: [],
						deleted: [],
					},
					warnings: [],
					budget_changes: {
						previous_total: trip.total_budget,
						new_total: trip.total_budget,
					},
				};
			}

			// 6. Obtener itinerarios solo si fechas cambian o presupuesto cambia
			const itineraries =
				datesChanged || budgetChanged
					? await this.itineraryModel.findAll({
							where: { trip_id: trip.id },
							order: [['date', 'ASC']],
							transaction,
							paranoid: false,
						})
					: [];

			// 7. Cálculos de duración solo si cambian fechas
			let oldDuration = 0,
				newDuration = 0,
				durationDiff = 0,
				startDiff = 0;
			if (datesChanged) {
				oldDuration = Math.ceil(
					(currentEnd.getTime() - currentStart.getTime()) / msPerDay
				);
				newDuration = Math.ceil(
					(requestedEnd.getTime() - requestedStart.getTime()) /
						msPerDay
				);
				durationDiff = newDuration - oldDuration;
				startDiff = diffDays(requestedStart, trip.start_date);
			}

			// 8. Actualizar solo campos cambiados
			const originalBudget = trip.total_budget;
			if (changedStart) trip.start_date = requestedStart;
			if (changedEnd) trip.end_date = requestedEnd;
			if (travelersChanged)
				trip.travelers_count = updateData.travelers_count!;
			if (budgetChanged) trip.total_budget = updateData.total_budget!;
			if (statusChanged) trip.status = updateData.status!;
			if (
				changedStart ||
				changedEnd ||
				travelersChanged ||
				budgetChanged ||
				statusChanged
			) {
				await trip.save({ transaction });
			}
			summary.budget_changes.previous_total = originalBudget;
			summary.budget_changes.new_total = trip.total_budget;

			// 9. Gestión de itinerarios si cambian fechas
			let workingItineraries = [...itineraries];
			if (datesChanged) {
				// Construir nuevas fechas requeridas
				const requiredDates: Date[] = [];
				for (let i = 0; i < newDuration; i++)
					requiredDates.push(
						new Date(requestedStart.getTime() + i * msPerDay)
					);

				// Scenario misma duración (shift)
				if (startDiff !== 0 && durationDiff === 0) {
					for (let i = 0; i < workingItineraries.length; i++) {
						const it = workingItineraries[i];
						const newDate = requiredDates[i];
						if (
							normalizeDate(it.date).getTime() !==
							newDate.getTime()
						) {
							it.date = newDate as any;
							await it.save({ transaction });
							summary.updated.push({ id: it.id, date: newDate });
						}
					}
				}

				// Extensión
				if (durationDiff > 0) {
					// Ajustar fechas existentes si hubo shift
					for (let i = 0; i < oldDuration; i++) {
						const it = workingItineraries[i];
						const desiredDate = requiredDates[i];
						if (
							normalizeDate(it.date).getTime() !==
							desiredDate.getTime()
						) {
							it.date = desiredDate as any;
							await it.save({ transaction });
							summary.updated.push({
								id: it.id,
								date: desiredDate,
							});
						}
					}
					// Crear nuevos
					const lastExisting =
						workingItineraries[workingItineraries.length - 1];
					for (let i = oldDuration; i < newDuration; i++) {
						const date = requiredDates[i];
						const newIt = await this.itineraryModel.create(
							{
								trip_id: trip.id,
								date: date as any,
								start_time: lastExisting
									? lastExisting.start_time
									: null,
								end_time: lastExisting
									? lastExisting.end_time
									: null,
								lat: parseFloat(trip.lat), // Convert string to number
								lng: parseFloat(trip.lng), // Convert string to number
								budget: 0,
								experience_type_ids: '',
								experience_types: '',
							},
							{ transaction }
						);
						workingItineraries.push(newIt);
						summary.created.push({ id: newIt.id, date });
					}
				}

				// Acortamiento
				if (durationDiff < 0) {
					const toDelete = workingItineraries.slice(newDuration);
					for (const it of toDelete) {
						await it.destroy({ transaction });
						summary.deleted.push({ id: it.id, date: it.date });
					}
					workingItineraries = workingItineraries.slice(
						0,
						newDuration
					);
					// Ajustar fechas restantes si hubo shift
					for (let i = 0; i < workingItineraries.length; i++) {
						const it = workingItineraries[i];
						const desiredDate = requiredDates[i];
						if (
							normalizeDate(it.date).getTime() !==
							desiredDate.getTime()
						) {
							it.date = desiredDate as any;
							await it.save({ transaction });
							summary.updated.push({
								id: it.id,
								date: desiredDate,
							});
						}
					}
				}
			}

			// 10. Redistribución de presupuesto (equal) si cambió total o cambió duración
			if (
				(budgetChanged || datesChanged) &&
				(datesChanged || workingItineraries.length > 0)
			) {
				// si fechas no cambiaron, cargar itinerarios (no se habían cargado)
				if (!datesChanged && workingItineraries.length === 0) {
					workingItineraries = await this.itineraryModel.findAll({
						where: { trip_id: trip.id },
						order: [['date', 'ASC']],
						transaction,
					});
				}
				const validCount =
					workingItineraries.length || (datesChanged ? 0 : 0);
				if (validCount > 0) {
					const perDay = trip.total_budget / validCount;
					for (const it of workingItineraries) {
						if (Number(it.budget) !== perDay) {
							it.budget = perDay as any;
							await it.save({ transaction });
							if (!summary.updated.find(u => u.id === it.id)) {
								summary.updated.push({
									id: it.id,
									date: it.date,
								});
							}
						}
					}
				}
			}

			await transaction.commit();
			return {
				trip: trip.toJSON(),
				itineraries_summary: {
					created: summary.created,
					updated: summary.updated,
					deleted: summary.deleted,
				},
				warnings: summary.warnings,
				budget_changes: summary.budget_changes,
			};
		} catch (error) {
			await transaction.rollback();
			this.logger.error(
				'Error updateTripWithItineraryManagement',
				error.stack || error.message
			);
			throw error;
		}
	}

	/**
	 * Rate a trip (1-5 stars)
	 */
	async rateTrip(tripId: number, rating: number): Promise<Trip> {
		try {
			this.logger.log(`Rating trip ${tripId} with ${rating} stars`);

			const trip = await this.tripModel.findByPk(tripId);

			if (!trip) {
				throw new NotFoundException(`Trip with ID ${tripId} not found`);
			}

			await trip.update({ rating });

			this.logger.log(`Trip ${tripId} rated successfully with ${rating} stars`);
			return trip;
		} catch (error) {
			this.logger.error(
				`Error rating trip ${tripId}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}
}
