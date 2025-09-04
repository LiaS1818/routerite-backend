// lugar.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FiltrosLugarDto } from './dto/filters-place.dto';
import { Place } from './place.entity';

@Injectable()
export class PlaceService implements OnModuleInit {
	private places: Place[] = [];

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

	async filtrarLugares(filtros: FiltrosLugarDto): Promise<Place[]> {
		let lugaresFiltrados = [...this.places];

		// Filtrar por categoría
		if (filtros.category) {
			lugaresFiltrados = lugaresFiltrados.filter(lugar =>
				lugar.categories.some(
					cat =>
						cat.name
							.toLowerCase()
							.includes(filtros.category.toLowerCase()) ||
						cat.plural_name
							.toLowerCase()
							.includes(filtros.category.toLowerCase())
				)
			);
		}

		//Filtrar por mayor ranking
		if (filtros.ratingMin !== undefined) {
			lugaresFiltrados = lugaresFiltrados.filter(
				lugar => lugar.rating >= filtros.ratingMin
			);
		}

		if (filtros.ratingMax !== undefined) {
			lugaresFiltrados = lugaresFiltrados.filter(
				lugar => lugar.rating <= filtros.ratingMax
			);
		}

		// Filtrar por rango de precio
		if (filtros.priceMin !== undefined) {
			lugaresFiltrados = lugaresFiltrados.filter(
				lugar => lugar.price >= filtros.priceMin
			);
		}

		if (filtros.priceMax !== undefined) {
			lugaresFiltrados = lugaresFiltrados.filter(
				lugar => lugar.price <= filtros.priceMax
			);
		}

		// Ordenar por precio
		if (filtros.orderBy) {
			lugaresFiltrados.sort((a, b) => {
				if (filtros.orderBy === 'price-asc') {
					return a.price - b.price;
				} else {
					return b.price - a.price;
				}
			});
		}

		return lugaresFiltrados;
	}

	// Método adicional para obtener todos los lugares
	async getAllPlaces(): Promise<Place[]> {
		return this.places;
	}

	// Método para obtener un lugar por ID
	async getPlaceById(fsq_id: string): Promise<Place | null> {
		return this.places.find(place => place.fsq_id === fsq_id) || null;
	}

	// Obtener lista de categorías disponibles
	async getAvailableCategories(): Promise<string[]> {
		const categorias = new Set<string>();

		this.places.forEach(lugar => {
			lugar.categories.forEach(cat => {
				categorias.add(cat.name);
				categorias.add(cat.plural_name);
			});
		});
		return Array.from(categorias);
	}
}
