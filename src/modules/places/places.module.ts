import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlaceController } from './place.controller';
import { PlacesSearchService } from './services/places-search.service';
import { PlacesProcessorService } from './services/places-processor.service';
import { FoursquareMockModule } from '../../common/services/foursquare/foursquare-mock.module';
import { PlacesService } from './places.service';
import { TripsModule } from '../trips/trips.module';
import { ItinerariesModule } from '../itineraries/itineraries.module';

@Module({
	imports: [
		ConfigModule,
		FoursquareMockModule,
		TripsModule,
		forwardRef(() => ItinerariesModule),
	],
	providers: [
		PlacesService,
		PlacesSearchService,
		PlacesProcessorService,
	],
	controllers: [PlaceController],
	exports: [PlacesService, PlacesSearchService, PlacesProcessorService],
})
export class PlacesModule {}
