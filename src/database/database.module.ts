import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { Viaje } from './models/viaje.model';
import { initializeAssociations } from './models';

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
				models: [User, Viaje],
				autoLoadModels: true,
				synchronize: false, // Usar migraciones en su lugar
				logging:
					configService.get('NODE_ENV') === 'development'
						? console.log
						: false,
			}),
			inject: [ConfigService],
		}),
		SequelizeModule.forFeature([User, Viaje]),
	],
	exports: [SequelizeModule],
})
export class DatabaseModule implements OnModuleInit {
	onModuleInit() {
		// Inicializar asociaciones después de que Sequelize esté configurado
		initializeAssociations();
	}
}
