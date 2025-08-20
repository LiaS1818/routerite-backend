import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TripsModule } from './modules/trips/trips.module';
import { ItinerariesModule } from './modules/itineraries/itineraries.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['environments/.env.local', 'environments/.env'],
		}),
		DatabaseModule,
		AuthModule,
		UsersModule,
		TripsModule,
		ItinerariesModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
