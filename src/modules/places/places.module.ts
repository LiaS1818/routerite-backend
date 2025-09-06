// Place Module
import { Module } from '@nestjs/common';
import { FSQRPlace } from 'src/common/interfaces/FSQRPlace.interface';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';

@Module({
	imports: [],
	providers: [PlaceService],
	controllers: [PlaceController],
})
export class PlacesModule {}
