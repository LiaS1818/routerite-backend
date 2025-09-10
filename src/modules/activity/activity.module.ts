import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { Activity, Itinerary, Trip, User } from 'src/database/models';
import { TripAccessValidatorModule } from '../../common/services/trip-access-validator.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
	imports: [
		SequelizeModule.forFeature([Activity, Itinerary, Trip, User]),
		TripAccessValidatorModule,
		SupabaseModule,
	],
	controllers: [ActivityController],
	providers: [ActivityService],
	exports: [ActivityService],
})
export class ActivityModule {}
