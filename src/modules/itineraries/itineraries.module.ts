import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItinerariesService } from './itineraries.service';
import { ItinerariesController } from './itineraries.controller';
import { ItineraryGeneratorService } from './services/itinerary-generator.service';
import { ItineraryValidatorService } from './services/itinerary-validator.service';
import { Itinerary, Trip, User, Activity } from '../../database/models';
import { ConfigModule } from '@nestjs/config';
import { TripAccessValidatorModule } from '../../common/services/trip-access-validator.module';
import { FoursquareMockModule } from '../../common/services/foursquare/foursquare-mock.module';
import { OptimizerModule } from '../optimizer/optimizer.module';
import { PlacesModule } from '../places/places.module';
import { ActivityModule } from '../activity/activity.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		SequelizeModule.forFeature([Itinerary, Trip, User, Activity]),
		ConfigModule,
		TripAccessValidatorModule,
		FoursquareMockModule,
		OptimizerModule,
		forwardRef(() => PlacesModule),
		ActivityModule,
		SupabaseModule,
		AuthModule,
	],
	providers: [
		ItinerariesService,
		ItineraryGeneratorService,
		ItineraryValidatorService,
	],
	controllers: [ItinerariesController],
	exports: [ItinerariesService, ItineraryGeneratorService, ItineraryValidatorService],
})
export class ItinerariesModule {}
