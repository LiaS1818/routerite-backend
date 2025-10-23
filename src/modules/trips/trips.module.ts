// filepath: /home/cardonapablo/Documentos/Proyectos/RouteRite/routerite-backend/src/modules/trips/trips.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { IcsGeneratorService } from './ics-generator.service';
import { Trip, User, Itinerary, TripInvitation } from '../../database/models';
import { TripAccessValidatorModule } from '../../common/services/trip-access-validator.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
	imports: [
		SequelizeModule.forFeature([Trip, User, Itinerary, TripInvitation]),
		TripAccessValidatorModule,
		HttpModule,
		ConfigModule,
		SupabaseModule,
	],
	controllers: [TripsController],
	providers: [TripsService, IcsGeneratorService],
	exports: [TripsService],
})
export class TripsModule {}
