import {
	Controller,
	Post,
	Body,
	Param,
	Get,
	Patch,
	UseGuards,
	Request,
	Render,
	Res,
	HttpStatus,
	Delete,
	Query,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TripInvitationsService } from './trip-invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Controller('trip-invitations')
export class TripInvitationsController {
	constructor(
		private readonly tripInvitationsService: TripInvitationsService
	) {}

	/**
	 * Create a new trip invitation and get share URL
	 */
	@Post(':tripId/invite')
	@UseGuards(JwtAuthGuard)
	async createInvitation(
		@Body() createInvitationDto: CreateInvitationDto,
		@Param('tripId') tripId: number,
		@Request() req: any
	) {
		const result = await this.tripInvitationsService.createInvitation(
			tripId,
			createInvitationDto,
			req.user.id
		);

		return {
			message: 'Invitation created successfully',
			shareUrl: result.shareUrl,
			invitation: result.invitation,
			invitedUser: result.invitedUser,
		};
	}

	/**
	 * Display invitation share page
	 */
	@Get(':encodedTripId/share/:encodedUserId')
	@Render('trip-invitation')
	async showInvitationPage(
		@Param('encodedTripId') encodedTripId: string,
		@Param('encodedUserId') encodedUserId: string
	) {
		try {
			const invitation =
				await this.tripInvitationsService.getInvitationForShare(
					encodedTripId,
					encodedUserId
				);

			return {
				invitation,
				encodedTripId,
				encodedUserId,
				trip: invitation.trip,
				inviter: invitation.inviter,
				invitedUser: invitation.invitedUser,
			};
		} catch (error) {
			return {
				error: error.message,
			};
		}
	}

	/**
	 * Accept trip invitation
	 */
	@Patch(':encodedTripId/share/:encodedUserId/accept')
	async acceptInvitation(
		@Param('encodedTripId') encodedTripId: string,
		@Param('encodedUserId') encodedUserId: string,
		@Res() res: Response
	) {
		try {
			await this.tripInvitationsService.acceptInvitation(
				encodedTripId,
				encodedUserId
			);
			return res.status(HttpStatus.OK).json({
				message: 'Invitation accepted successfully',
				status: 'accepted',
			});
		} catch (error) {
			return res.status(HttpStatus.BAD_REQUEST).json({
				message: error.message,
			});
		}
	}

	/**
	 * Reject trip invitation
	 */
	@Patch('trips/:encodedTripId/share/:encodedUserId/reject')
	async rejectInvitation(
		@Param('encodedTripId') encodedTripId: string,
		@Param('encodedUserId') encodedUserId: string,
		@Res() res: Response
	) {
		try {
			await this.tripInvitationsService.rejectInvitation(
				encodedTripId,
				encodedUserId
			);
			return res.status(HttpStatus.OK).json({
				message: 'Invitation rejected',
				status: 'rejected',
			});
		} catch (error) {
			return res.status(HttpStatus.BAD_REQUEST).json({
				message: error.message,
			});
		}
	}

	/**
	 * Delete a trip invitation (only accessible to trip owner)
	 */
	@Delete(':tripId')
	@UseGuards(JwtAuthGuard)
	async deleteInvitation(
		@Param('tripId') tripId: number,
		@Query('email') email: string,
		@Request() req: any
	) {
		await this.tripInvitationsService.deleteInvitation(
			tripId,
			email,
			req.user.id
		);
		return {
			message: 'Invitation deleted successfully',
		};
	}
}
