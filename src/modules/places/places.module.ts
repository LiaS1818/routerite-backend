import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { PlacesSearchService } from './services/places-search.service';
import { PlacesProcessorService } from './services/places-processor.service';
import { FoursquareMockModule } from '../../common/services/foursquare/foursquare-mock.module';

@Module({
	imports: [
		ConfigModule,
		FoursquareMockModule,
	],
	providers: [
		PlaceService,
		PlacesSearchService,
		PlacesProcessorService,
	],
	controllers: [PlaceController],
	exports: [PlaceService, PlacesSearchService, PlacesProcessorService],
})
export class PlacesModule {}
