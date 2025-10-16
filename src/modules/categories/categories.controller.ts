// src/categories/categories.controller.ts
import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Default } from 'sequelize-typescript';

@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) { }

	// @Get('search')
	// async searchCategories(
	// 	@Query('q') query: string = '',
	// 	@Query('limit') limit: string = '20'
	// ) {
	// 	const categories = await this.categoriesService.search(
	// 		query,
	// 		parseInt(limit)
	// 	);
	// 	return {
	// 		success: true,
	// 		data: categories,
	// 		count: categories.length,
	// 	};
	// }
	// // Obtener categorías populares
	// @Get('popular')
	// async getPopularCategories(@Query('limit') limit: string = '10') {
	// 	return this.categoriesService.getPopular(parseInt(limit));
	// }

	// // Obtener todas las categorías (paginado)
	// @Get()
	// async getAllCategories(
	// 	@Query('page') page: string = '1',
	// 	@Query('limit') limit: string = '50'
	// ) {
	// 	return this.categoriesService.getAll(parseInt(page), parseInt(limit));
	// }

	@Get()
	async list(
		@Query('q') q?: string,
		@Query('sort') sort: 'name' | 'label' = 'name',
		@Query('order') order: 'ASC' | 'DESC' = 'ASC',
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
		@Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50
	) {
		return this.categoriesService.list({ q, sort, order, page, limit });
	}

}
