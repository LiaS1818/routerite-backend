import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TripsModule } from './modules/trips/trips.module';
import { ItinerariesModule } from './modules/itineraries/itineraries.module';
import { ActivityModule } from './modules/activity/activity.module';
import { TripInvitationsModule } from './modules/trip-invitations/trip-invitations.module';
import { HttpModule } from '@nestjs/axios';
import { CategoriesModule } from './modules/categories/categories.module';
import { PlacesModule } from './modules/places/places.module';
import { FoursquareMockModule } from './common/services/foursquare/foursquare-mock.module';
import { NotificationsModule } from './common/services/notifications/notifications.module';
import { RouteriteDownloadController } from './download/routerite-download.controller';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['environments/.env.production'],
		}),
		DatabaseModule,
		AuthModule,
		UsersModule,
		TripsModule,
		ItinerariesModule,
		ActivityModule,
		TripInvitationsModule,
		HttpModule.register({
			timeout: 5000,
			maxRedirects: 5,
		}),
		CategoriesModule,
		PlacesModule,
		FoursquareMockModule,
		NotificationsModule,
	],
	controllers: [AppController, RouteriteDownloadController],
	providers: [AppService],
})
export class AppModule {}
