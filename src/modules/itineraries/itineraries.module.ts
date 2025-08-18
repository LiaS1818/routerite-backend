import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItinerariesService } from './itineraries.service';
import { ItinerariesController } from './itineraries.controller';
import { Itinerary } from '../../database/models/itinerary.model';

@Module({
  imports: [SequelizeModule.forFeature([Itinerary])],
  providers: [ItinerariesService],
  controllers: [ItinerariesController],
})
export class ItinerariesModule {}
