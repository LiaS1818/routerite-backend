// Place Module
import { Module } from '@nestjs/common';
import { FSQRPlace } from 'src/common/interfaces/FSQRPlace.interface';
import { PlacesService } from './places.service';
import { PlaceController } from './place.controller';
import { FoursquareMockService } from 'src/common/services/foursquare/foursquare-mock.service';

@Module({
	imports: [],
	providers: [PlacesService, FoursquareMockService],
	controllers: [PlaceController],
})
export class PlacesModule {}
