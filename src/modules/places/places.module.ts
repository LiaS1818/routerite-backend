import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlaceController } from './place.controller';
import { PlacesSearchService } from './services/places-search.service';
import { PlacesProcessorService } from './services/places-processor.service';
import { FoursquareMockModule } from '../../common/services/foursquare/foursquare-mock.module';
import { PlacesService } from './places.service';

@Module({
	imports: [
		ConfigModule,
		FoursquareMockModule,
	],
	providers: [
		PlacesService,
		PlacesSearchService,
		PlacesProcessorService,
	],
	controllers: [PlaceController],
	exports: [PlacesSearchService, PlacesProcessorService],
})
export class PlacesModule {}
