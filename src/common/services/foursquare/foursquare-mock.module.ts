import { Global, Module } from '@nestjs/common';
import { FoursquareMockService } from './foursquare-mock.service';

@Global()
@Module({
	imports: [],
	providers: [FoursquareMockService],
	exports: [FoursquareMockService],
})
export class FoursquareMockModule {}
