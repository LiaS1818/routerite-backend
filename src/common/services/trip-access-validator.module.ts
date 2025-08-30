import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TripAccessValidatorService } from './trip-access-validator.service';
import { Trip, Itinerary, User } from '../../database/models';

@Module({
	imports: [SequelizeModule.forFeature([Trip, Itinerary, User])],
	providers: [TripAccessValidatorService],
	exports: [TripAccessValidatorService],
})
export class TripAccessValidatorModule {}
