import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FoursquareService } from './foursquare.service';
import { FoursquarePlacesService } from './foursquarePlace.service';
import { FoursquarePhotosService } from './foursquarePlacePhotos.service';

@Module({
	imports: [HttpModule, ConfigModule],
	providers: [
		FoursquareService,
		FoursquarePlacesService,
		FoursquarePhotosService,
	],
	exports: [
		FoursquareService,
		FoursquarePlacesService,
		FoursquarePhotosService,
	], // Exportar para usar en otros módulos
})
export class FoursquareModule {}
