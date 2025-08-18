import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
				autoLoadModels: true,
				synchronize: true, // Usar migraciones en su lugar
				sync: { alter: true },
				logging:
					configService.get('NODE_ENV') === 'development'
						? console.log
						: false,
			}),
			inject: [ConfigService],
		})
	],
	exports: [SequelizeModule],
})
export class DatabaseModule implements OnModuleInit {
	onModuleInit() {
		// Inicializar asociaciones después de que Sequelize esté configurado
		initializeAssociations();
	}
}
