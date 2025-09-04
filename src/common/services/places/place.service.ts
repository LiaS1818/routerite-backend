// lugar.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FilterPlacesDto } from './dto/filters-place.dto';
import { FSQRPlace } from 'src/common/interfaces/FSQRPlace.interface';

@Injectable()
export class PlaceService implements OnModuleInit {
	private places: FSQRPlace[] = [];

	async onModuleInit() {
		this.cargarLugaresDesdeJSON();
	}

	private cargarLugaresDesdeJSON() {
		try {
			const filePath = join(
				process.cwd(),
				'guadalajara_places_50_real.json'
			);
			const data = readFileSync(filePath, 'utf8');
			this.places = JSON.parse(data);
			console.log(`✅ Cargados ${this.places.length} lugares desde JSON`);
		} catch (error) {
			console.error('❌ Error al cargar el archivo JSON:', error.message);
			this.places = []; // Array vacío en caso de error
		}
	}

	async filtrarLugares(filter: FilterPlacesDto): Promise<FSQRPlace[]> {
		let filteredPlaces = [...this.places];

		// Filtrar por categoría
		if (filter.category) {
			filteredPlaces = filteredPlaces.filter(place =>
				place.categories.some(
					cat =>
						cat.name
							.toLowerCase()
							.includes(filter.category.toLowerCase()) ||
						cat.plural_name
							.toLowerCase()
							.includes(filter.category.toLowerCase())
				)
			);
		}

		//Filtrar por mayor ranking
		if (filter.ratingMin !== undefined) {
			filteredPlaces = filteredPlaces.filter(
				place => place.rating >= filter.ratingMin
			);
		}

		if (filter.ratingMax !== undefined) {
			filteredPlaces = filteredPlaces.filter(
				place => place.rating <= filter.ratingMax
			);
		}

		// Filtrar por rango de precio
		if (filter.priceMin !== undefined) {
			filteredPlaces = filteredPlaces.filter(
				place => place.price >= filter.priceMin
			);
		}

		if (filter.priceMax !== undefined) {
			filteredPlaces = filteredPlaces.filter(
				place => place.price <= filter.priceMax
			);
		}

		// Ordenar por precio
		if (filter.orderBy) {
			filteredPlaces.sort((a, b) => {
				if (filter.orderBy === 'price-asc') {
					return a.price - b.price;
				} else {
					return b.price - a.price;
				}
			});
		}

		return filteredPlaces;
	}

	// Método adicional para obtener todos los lugares
	async getAllPlaces(): Promise<FSQRPlace[]> {
		return this.places;
	}

	// Método para obtener un lugar por ID
	async getPlaceById(fsq_id: string): Promise<FSQRPlace | null> {
		return this.places.find(place => place.fsq_id === fsq_id) || null;
	}

	// Obtener lista de categorías disponibles
	async getAvailableCategories(): Promise<string[]> {
		const categorias = new Set<string>();

		this.places.forEach(place => {
			place.categories.forEach(cat => {
				categorias.add(cat.name);
				categorias.add(cat.plural_name);
			});
		});
		return Array.from(categorias);
	}
}
