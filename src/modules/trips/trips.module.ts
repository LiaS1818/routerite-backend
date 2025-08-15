// filepath: /home/cardonapablo/Documentos/Proyectos/RouteRite/routerite-backend/src/modules/trips/trips.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { Trip } from '../../database/models/trip.model';
import { User } from '../../database/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Trip, User])],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService]
})
export class TripsModule {}
