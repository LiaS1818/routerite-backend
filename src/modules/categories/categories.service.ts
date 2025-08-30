// src/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FoursquareCategory } from '../../database/models/foursquare-categories.model';

@Injectable()
export class CategoriesService {
	constructor(
		@InjectModel(FoursquareCategory)
		private categoryModel: typeof FoursquareCategory
	) {}

	async search(q = '', limit = 20) {
		const lim = Math.max(1, Math.min(Number(limit) || 20, 50));

		if (!q) {
			return this.categoryModel.findAll({
				limit: lim,
				order: [['name', 'ASC']],
			});
		}

		// Búsqueda con Sequelize
		const categories = await this.categoryModel.findAll({
			where: {
				[Op.or]: [
					{ name: { [Op.iLike]: `%${q}%` } },
					{ label: { [Op.iLike]: `%${q}%` } },
				],
			},
			limit: lim,
			order: [
				// Orden personalizado con Sequelize literal
				this.categoryModel.sequelize
					? this.categoryModel.sequelize.literal(`
              CASE
                WHEN lower(name) = lower('${q.replace(/'/g, "''")}') THEN 0
                WHEN lower(name) LIKE lower('${q.replace(/'/g, "''")}') || '%' THEN 1
                ELSE 2
              END
            `)
					: ['name', 'ASC'],
				['name', 'ASC'],
			],
			raw: true, // Para mejor performance
		});

		return categories;
	}

	async getPopular(limit = 10) {
		return this.categoryModel.findAll({
			limit: Math.max(1, Math.min(limit, 20)),
			order: [['name', 'ASC']],
			attributes: ['id', 'name', 'label'],
		});
	}

	async getAll(page = 1, limit = 50) {
		const offset = (page - 1) * limit;
		// Cambiar para devolver un arreglo
		const categories = await this.categoryModel.findAll({
			offset,
			limit: Math.min(limit, 100),
			order: [['name', 'ASC']],
			attributes: ['id', 'name', 'label'],
		});
		return categories;
	}

	async findById(id: string) {
		return this.categoryModel.findByPk(id, {
			attributes: ['id', 'name', 'label'],
		});
	}
}
