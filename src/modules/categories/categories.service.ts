// categories.service.ts
import { Injectable } from '@nestjs/common';
import { FoursquareCategory } from '../../database/models/foursquare-categories.model';
import { Op, WhereOptions } from 'sequelize';

type ListParams = {
	q?: string;
	sort?: 'name' | 'label';
	order?: 'ASC' | 'DESC';
	page: number;
	limit: number;
	parentName?: string;
};

@Injectable()
export class CategoriesService {
	async list({
		q,
		sort = 'name',
		order = 'ASC',
		page,
		limit,
		parentName,
	}: ListParams) {
		const where: WhereOptions = {};

		if (q) {
			Object.assign(where, {
				[Op.or]: [
					{ name: { [Op.iLike]: `%${q}%` } },
					{ label: { [Op.iLike]: `%${q}%` } },
				],
			});
		}

		// filtro jerarquico opcional por padre
		if (parentName) {
			(where as any)[Op.and] = [
				...((where as any)[Op.and] ?? []),
				{ label: { [Op.iLike]: `${parentName} > %` } }, // hijos directos
			];
		}

		const offset = (page - 1) * limit;

		const { rows, count } = await FoursquareCategory.findAndCountAll({
			where,
			order: [[sort, order]],
			limit,
			offset,
			attributes: ['id', 'name', 'label'],
			raw: true,
		});

		const data = rows.map(r => {
			const label = r.label ?? '';
			const breadcrumbs = label
				.split('>')
				.map(s => s.trim())
				.filter(Boolean);

			const level = breadcrumbs.length ? breadcrumbs.length - 1 : 0;
			const parent =
				breadcrumbs.length > 1
					? breadcrumbs[breadcrumbs.length - 2]
					: null;

			// retornar solo breadcrumbs en la posicion 1 y 2
			// si hay solo 1 elemento, devolver ese elemento para evitar array vacío
			const resultBreadcrumbs = breadcrumbs.length === 1
				? [breadcrumbs[0]]
				: breadcrumbs.slice(1, 3);

			return {
				id: r.id,
				name: r.name,
				label: r.label,
				breadcrumbs: resultBreadcrumbs,
				level,
				parent,
			};
		});

		return {
			data,
			meta: {
				total: count,
				page,
				limit,
				totalPages: Math.ceil(count / limit),
				sort,
				order,
				q: q ?? null,
			},
		};
	}

	async findById(id: string) {
		return await FoursquareCategory.findOne({
			where: {
				id
			}
		})
	}
}
