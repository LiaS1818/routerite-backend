import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItinerariesService } from './itineraries.service';
import { ItinerariesController } from './itineraries.controller';
import { Itinerary, Trip, User, Activity } from '../../database/models';
import { ConfigModule } from '@nestjs/config';
import { TripAccessValidatorModule } from '../../common/services/trip-access-validator.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
	imports: [
		SequelizeModule.forFeature([Itinerary, Trip, User, Activity]),
		ConfigModule,
		TripAccessValidatorModule
	],
	providers: [ItinerariesService],
	controllers: [ItinerariesController],
	exports: [ItinerariesService],
})
export class ItinerariesModule {}
