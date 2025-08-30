import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Configure Handlebars
	app.setBaseViewsDir(join(__dirname, '..', 'views'));
	app.setViewEngine('hbs');

	// Register Handlebars helpers
	hbs.registerHelper('formatDate', function (date) {
		if (!date) return '';
		return new Date(date).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	});

	hbs.registerHelper('substring', function (str, start, end) {
		if (!str) return '';
		return str.substring(start, end);
	});

	app.enableCors({
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		allowedHeaders: 'Content-Type, Accept, Authorization',
	});
	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe());
	const port = process.env.PORT || 3000;
	await app.listen(port);

	console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
