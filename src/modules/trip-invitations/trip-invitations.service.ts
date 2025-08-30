import {
	Injectable,
	NotFoundException,
	BadRequestException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TripInvitation } from '../../database/models/trip-invitation.model';
import { User } from '../../database/models/user.model';
import { Trip } from '../../database/models/trip.model';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';

@Injectable()
export class TripInvitationsService {
	private readonly logger = new Logger(TripInvitationsService.name);

	constructor(
		@InjectModel(TripInvitation)
		private readonly tripInvitationModel: typeof TripInvitation,
		@InjectModel(User)
		private readonly userModel: typeof User,
		@InjectModel(Trip)
		private readonly tripModel: typeof Trip,
		private readonly configService: ConfigService
	) {}

	/**
	 * Encode ID for URL security
	 */
	private encodeId(id: number): string {
		return Buffer.from(id.toString()).toString('base64url');
	}

	/**
	 * Decode ID from URL
	 */
	private decodeId(encodedId: string): number {
		try {
			const decoded = Buffer.from(encodedId, 'base64url').toString();
			const id = parseInt(decoded, 10);
			if (isNaN(id)) {
				throw new Error('Invalid ID');
			}
			return id;
		} catch (error) {
			throw new BadRequestException('Invalid encoded ID');
		}
	}

	/**
	 * Create a trip invitation and generate share URL
	 */
	async createInvitation(
		tripId: number,
		createInvitationDto: CreateInvitationDto,
		inviterId: number
	): Promise<{
		invitation: TripInvitation;
		shareUrl: string;
		invitedUser: User;
	}> {
		this.logger.log(
			`Creating invitation for trip ${tripId} by user ${inviterId}`
		);

		// Verify trip exists and user is owner
		const trip = await this.tripModel.findOne({
			where: { id: tripId, user_id: inviterId },
		});

		if (!trip) {
			throw new NotFoundException(
				'Trip not found or you are not the owner'
			);
		}

		// Find the user to invite
		const invitedUser = await this.userModel.findOne({
			attributes: ['id', 'name', 'email', 'profile_picture'],
			where: { email: createInvitationDto.email },
		});

		if (!invitedUser) {
			throw new NotFoundException('User with this email not found');
		}

		// Check if invitation already exists
		let invitation = await this.tripInvitationModel.findOne({
			where: {
				trip_id: tripId,
				user_id: invitedUser.id,
			},
		});

		if (invitation) {
			// If invitation exists but is not pending, throw error
			if (invitation.status !== 'pending') {
				throw new BadRequestException(
					`User invitation already ${invitation.status} for this trip`
				);
			}

			// If invitation is pending, regenerate URL without creating new record
			this.logger.log(
				`Regenerating share URL for existing pending invitation ${invitation.id}`
			);
		} else {
			// Create new invitation
			invitation = await this.tripInvitationModel.create({
				trip_id: tripId,
				user_id: invitedUser.id,
				invited_by: inviterId,
				status: 'pending',
			});

			this.logger.log(`Created new invitation ${invitation.id}`);
		}

		// Generate share URL with /api prefix
		const backendUrl = this.configService.get<string>(
			'BACKEND_URL',
			'http://localhost:3000'
		);
		const encodedTripId = this.encodeId(tripId);
		const encodedUserId = this.encodeId(invitedUser.id);
		const shareUrl = `${backendUrl}/api/trip-invitations/${encodedTripId}/share/${encodedUserId}`;

		return { invitation, shareUrl, invitedUser };
	}

	/**
	 * Get invitation details for share page
	 */
	async getInvitationForShare(
		encodedTripId: string,
		encodedUserId: string
	): Promise<any> {
		const tripId = this.decodeId(encodedTripId);
		const userId = this.decodeId(encodedUserId);

		const invitation = await this.tripInvitationModel.findOne({
			where: {
				trip_id: tripId,
				user_id: userId,
				status: {
					[Op.ne]: 'accepted',
				},
			},
			include: [
				{
					model: Trip,
					as: 'trip',
					attributes: [
						'id',
						'destination',
						'start_date',
						'end_date',
						'cover_image',
					],
				},
				{
					model: User,
					as: 'inviter',
					attributes: ['name', 'profile_picture'],
				},
				{
					model: User,
					as: 'invitedUser',
					attributes: ['name', 'email'],
				},
			],
		});

		if (!invitation) {
			throw new NotFoundException(
				'Invitation not found or already processed'
			);
		}

		// Support for re-inviting a user who previously rejected the invitation
		await invitation.update({ status: 'pending' });

		return invitation;
	}

	/**
	 * Accept trip invitation
	 */
	async acceptInvitation(
		encodedTripId: string,
		encodedUserId: string
	): Promise<TripInvitation> {
		const tripId = this.decodeId(encodedTripId);
		const userId = this.decodeId(encodedUserId);

		const invitation = await this.tripInvitationModel.findOne({
			where: {
				trip_id: tripId,
				user_id: userId,
				status: 'pending',
			},
		});

		if (!invitation) {
			throw new NotFoundException(
				'Invitation not found or already processed'
			);
		}

		invitation.status = 'accepted';
		await invitation.save();

		this.logger.log(`User ${userId} accepted invitation to trip ${tripId}`);
		return invitation;
	}

	/**
	 * Reject trip invitation
	 */
	async rejectInvitation(
		encodedTripId: string,
		encodedUserId: string
	): Promise<TripInvitation> {
		const tripId = this.decodeId(encodedTripId);
		const userId = this.decodeId(encodedUserId);

		const invitation = await this.tripInvitationModel.findOne({
			where: {
				trip_id: tripId,
				user_id: userId,
				status: 'pending',
			},
		});

		if (!invitation) {
			throw new NotFoundException(
				'Invitation not found or already processed'
			);
		}

		invitation.status = 'rejected';
		await invitation.save();

		this.logger.log(`User ${userId} rejected invitation to trip ${tripId}`);
		return invitation;
	}
}
