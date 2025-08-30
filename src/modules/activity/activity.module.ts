import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { Activity, Itinerary, Trip, User } from 'src/database/models';
import { FoursquareModule } from 'src/common/services/foursquare/foursquare.module';
import { TripAccessValidatorModule } from '../../common/services/trip-access-validator.module';

@Module({
	imports: [
		SequelizeModule.forFeature([Activity, Itinerary, Trip, User]),
		FoursquareModule,
		TripAccessValidatorModule,
	],
	controllers: [ActivityController],
	providers: [ActivityService],
	exports: [ActivityService],
})
export class ActivityModule {}
