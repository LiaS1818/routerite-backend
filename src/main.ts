import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

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
