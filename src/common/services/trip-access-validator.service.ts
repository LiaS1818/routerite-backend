import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Trip, User, Itinerary } from '../../database/models';
import { Op } from 'sequelize';

@Injectable()
export class TripAccessValidatorService {
	private readonly logger = new Logger(TripAccessValidatorService.name);

	constructor(
		@InjectModel(Trip)
		private readonly tripModel: typeof Trip,
		@InjectModel(Itinerary)
		private readonly itineraryModel: typeof Itinerary
	) {}

	/**
	 * Check if user has access to trip (owner or accepted guest)
	 */
	async validateTripAccess(tripId: number, userId: number): Promise<void> {
		console.log('Validating trip access for tripId:', tripId, ", userId:", userId);
		const trip = await this.tripModel.findOne({
			where: { id: tripId },
			include: [
				{
					model: User,
					as: 'guests',
					where: { id: userId },
					through: {
						where: { status: 'accepted' },
						attributes: [],
					},
					required: false,
				},
			],
		});

		if (!trip) {
			throw new NotFoundException('Trip not found');
		}

		const isOwner = trip.user_id === userId;
		const isAcceptedGuest = trip.guests && trip.guests.length > 0;

		if (!isOwner && !isAcceptedGuest) {
			throw new ForbiddenException('Access denied to this trip');
		}
	}

	/**
	 * Check if user is trip owner (for write operations)
	 */
	async validateTripOwnership(tripId: number, userId: number): Promise<void> {
		const trip = await this.tripModel.findOne({
			where: { id: tripId, user_id: userId },
		});

		if (!trip) {
			throw new ForbiddenException(
				'Only trip owners can perform this action'
			);
		}
	}

	/**
	 * Check if user has access to trip through itinerary (owner or accepted guest)
	 */
	async validateTripAccessThroughItinerary(
		itineraryId: number,
		userId: number
	): Promise<void> {
		const itinerary = await this.itineraryModel.findOne({
			where: { id: itineraryId },
			include: [
				{
					model: Trip,
					as: 'trip',
					include: [
						{
							model: User,
							as: 'guests',
							where: { id: userId },
							through: {
								where: { status: 'accepted' },
								attributes: [],
							},
							required: false,
						},
					],
				},
			],
		});

		if (!itinerary || !itinerary.trip) {
			throw new NotFoundException('Itinerary or trip not found');
		}

		const isOwner = itinerary.trip.user_id === userId;
		const isAcceptedGuest =
			itinerary.trip.guests && itinerary.trip.guests.length > 0;

		if (!isOwner && !isAcceptedGuest) {
			throw new ForbiddenException('Access denied to this trip');
		}
	}

	/**
	 * Check if user is trip owner through itinerary (for write operations)
	 */
	async validateTripOwnershipThroughItinerary(
		itineraryId: number,
		userId: number
	): Promise<void> {
		const itinerary = await this.itineraryModel.findOne({
			where: { id: itineraryId },
			include: [
				{
					model: Trip,
					as: 'trip',
					where: { user_id: userId },
				},
			],
		});

		if (!itinerary || !itinerary.trip) {
			throw new ForbiddenException(
				'Only trip owners can perform this action'
			);
		}
	}

	/**
	 * Get trip ID from itinerary ID
	 */
	async getTripIdFromItinerary(itineraryId: number): Promise<number> {
		const itinerary = await this.itineraryModel.findByPk(itineraryId, {
			attributes: ['trip_id'],
		});

		if (!itinerary) {
			throw new NotFoundException('Itinerary not found');
		}

		return itinerary.trip_id;
	}
}
