// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { Trip } from './models/trip.model';
import { Itinerary } from './models/itinerary.model';
import { Activity } from './models/activity.model';
import { TripInvitation } from './models';
import { FoursquareCategory } from './models/foursquare-categories.model';

@Module({
	imports: [
		SequelizeModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => {
				console.log("DATABASE URL", configService.get<string>('DATABASE_URL'))
				const isProduction = configService.get('NODE_ENV') == 'production' || true;
				console.log("Is proudction", isProduction)
				let dbConnection = {};
				if (isProduction) {
					dbConnection = {
						uri: configService.get<string>('DATABASE_URL'),
						// ssl: true
					};
				} else {
					dbConnection = {
						host: configService.get('DB_HOST') || 'localhost',
						port: configService.get('DB_PORT') || 5432,
						username:
							configService.get('DB_USERNAME') || 'postgres',
						password: configService.get('DB_PASSWORD') || '1234',
						database: configService.get('DB_NAME') || 'routerite',
					};
				}
				return {
					dialect: 'postgres',
					autoLoadModels: true,
					...dbConnection,
					models: [
						User,
						Trip,
						Itinerary,
						Activity,
						TripInvitation,
						FoursquareCategory,
					],
					logging: console.log,
				};
			},
			inject: [ConfigService],
		}),
		SequelizeModule.forFeature([
			User,
			Trip,
			Itinerary,
			Activity,
			TripInvitation,
			FoursquareCategory,
		]),
	],
	exports: [SequelizeModule],
})
export class DatabaseModule {}
