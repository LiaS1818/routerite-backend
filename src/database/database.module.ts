import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { Trip } from './models/trip.model';
import { Itinerary } from './models/itinerary.model';
import { Activity } from './models/activity.model';
import { TripInvitation } from './models';

@Module({
	imports: [
		SequelizeModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				dialect: 'postgres',
				host: configService.get('DB_HOST') || 'localhost',
				port: configService.get('DB_PORT') || 5432,
				username: configService.get('DB_USERNAME') || 'postgres',
				password: configService.get('DB_PASSWORD') || 'password',
				database: configService.get('DB_NAME') || 'routerite',
				autoLoadModels: true,
				synchronize: true,
				alter: true,
				models: [User, Trip, Itinerary, Activity, TripInvitation],
				logging:
					configService.get('NODE_ENV') === 'development'
						? console.log
						: false,
			}),
			inject: [ConfigService],
		}),
		SequelizeModule.forFeature([
			User,
			Trip,
			Itinerary,
			Activity,
			TripInvitation,
		]),
	],
	exports: [SequelizeModule],
})
export class DatabaseModule {}
