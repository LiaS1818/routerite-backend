// src/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { FoursquareCategory } from '../../database/models/foursquare-categories.model';

@Module({
	imports: [SequelizeModule.forFeature([FoursquareCategory])],
	controllers: [CategoriesController],
	providers: [CategoriesService],
	exports: [CategoriesService],
})
export class CategoriesModule {}
