import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const databaseConfig: SequelizeModuleOptions = {
	dialect: 'postgres',
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '5432'),
	username: process.env.DB_USERNAME || 'backend_agent',
	password: process.env.DB_PASSWORD || 'backend_agent',
	database: process.env.DB_NAME || 'routerite',
	autoLoadModels: true,
	logging: process.env.NODE_ENV === 'development' ? console.log : false,
};
