import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TripInvitationsService } from './trip-invitations.service';
import { TripInvitationsController } from './trip-invitations.controller';
import { TripInvitation } from '../../database/models/trip-invitation.model';
import { User } from '../../database/models/user.model';
import { Trip } from '../../database/models/trip.model';

@Module({
	imports: [SequelizeModule.forFeature([TripInvitation, User, Trip])],
	controllers: [TripInvitationsController],
	providers: [TripInvitationsService],
	exports: [TripInvitationsService],
})
export class TripInvitationsModule {}
