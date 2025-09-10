// Place Module
import { Module } from '@nestjs/common';
import { FSQRPlace } from 'src/common/interfaces/FSQRPlace.interface';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { FoursquareMockService } from 'src/common/services/foursquare/foursquare-mock.service';

@Module({
	imports: [],
	providers: [PlaceService, FoursquareMockService],
	controllers: [PlaceController],
})
export class PlacesModule {}
