// DEBE SER EL PRIMER IMPORT - Registra tsconfig-paths para resolver módulos correctamente
import './tsconfig-paths-bootstrap';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import { __express } from 'hbs';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Configure Handlebars
	// Use process.cwd() so views are resolved from the project root (works both
	// in development and when running compiled JS under `dist`).
	console.log('Dirname is', __dirname);
	app.setBaseViewsDir(join(process.cwd(), 'views'));
	app.setViewEngine('hbs');

	const staticPath = join(process.cwd(), 'public');
	console.log('Serving static files from:', staticPath);

	app.useStaticAssets(staticPath, {
	prefix: '/', // los sirve en /css, /images, /apk, etc.
	});

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
