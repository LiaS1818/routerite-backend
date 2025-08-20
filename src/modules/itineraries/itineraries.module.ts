import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItinerariesService } from './itineraries.service';
import { ItinerariesController } from './itineraries.controller';
import { Itinerary } from '../../database/models/itinerary.model';
import { TripsModule } from '../trips/trips.module';
import { Trip } from 'src/database/models/trip.model';
import { User } from 'src/database/models';

@Module({
  imports: [SequelizeModule.forFeature([Itinerary, Trip, User]),
  TripsModule,
],
  providers: [ItinerariesService],
  controllers: [ItinerariesController],
  exports: [ItinerariesService],
})
export class ItinerariesModule {}
