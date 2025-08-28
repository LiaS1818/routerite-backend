import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FoursquareService } from './foursquare.service';
import { FoursquarePlacesService } from './foursquarePlace.service';

@Module({
  imports: [
    HttpModule, 
    ConfigModule, 
  ],
  providers: [FoursquareService, FoursquarePlacesService],
  exports: [FoursquareService, FoursquarePlacesService], // Exportar para usar en otros módulos
})
export class FoursquareModule {}