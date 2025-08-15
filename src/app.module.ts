import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ViajesModule } from './modules/viajes/viajes.module';
import { ItinerariesModule } from './itineraries/itineraries.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['environments/.env.local', 'environments/.env'],
		}),
		DatabaseModule,
		AuthModule,
		UsersModule,
		ViajesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
