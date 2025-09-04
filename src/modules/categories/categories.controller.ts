// src/categories/categories.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Get('search')
	async searchCategories(
		@Query('q') query: string = '',
		@Query('limit') limit: string = '20'
	) {
		const categories = await this.categoriesService.search(
			query,
			parseInt(limit)
		);
		return categories;
	}
	// Obtener categorías populares
	@Get('popular')
	async getPopularCategories(@Query('limit') limit: string = '10') {
		return this.categoriesService.getPopular(parseInt(limit));
	}

	// Obtener todas las categorías (paginado)
	@Get()
	async getAllCategories(
		@Query('page') page: string = '1',
		@Query('limit') limit: string = '10'
	) {
		return this.categoriesService.getAll(parseInt(page), parseInt(limit));
	}
}
