// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
	],
	controllers: [PlaceController],
	providers: [PlaceService],
})
export class PlaceModule {}
