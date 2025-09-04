import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FoursquarePlacesService } from './foursquare-place.service';
import { FoursquarePhotosService } from './foursquare-place-photos.service';
import { FoursquareController } from 'src/foursquare/foursquare.controller';

@Module({
	imports: [HttpModule, ConfigModule],
	controllers: [FoursquareController],
	providers: [FoursquarePlacesService, FoursquarePhotosService],
	exports: [FoursquarePlacesService, FoursquarePhotosService], // Exportar para usar en otros módulos
})
export class FoursquareModule {}
