import { Injectable, Logger } from '@nestjs/common';
import * as ScoringUtils from '../../../shared/utils/scoring.utils';
import { PlaceSearchParams } from '../dto/place-search.dto';
import { ProcessedPlace } from '../dto/processed-place.dto';
import { FSQRPlace } from '../../../common/interfaces/FSQRPlace.interface';

@Injectable()
export class PlacesProcessorService {
	private readonly logger = new Logger(PlacesProcessorService.name);

	/**
	 * Procesa, filtra y enriquece lugares obtenidos de Foursquare
	 */
	async processPlaces(
		rawPlaces: FSQRPlace[],
		searchParams: PlaceSearchParams
	): Promise<ProcessedPlace[]> {
		this.logger.log(`Starting processing of ${rawPlaces.length} raw places`);

		// FASE 1: Filtrado Básico
		const basicFiltered = this.applyBasicFiltering(rawPlaces, searchParams);
		this.logger.log(`After basic filtering: ${basicFiltered.length} places remain`);

		// FASE 2: Enriquecimiento y Cálculos
		const enrichedPlaces = await this.enrichAndCalculate(basicFiltered, searchParams);
		this.logger.log(`After enrichment: ${enrichedPlaces.length} places processed`);

		// FASE 3: Selección de Top 50
		const selectedPlaces = this.selectTop50(enrichedPlaces);
		this.logger.log(`Final selection: ${selectedPlaces.length} places`);

		// FASE 4: Construcción del Resultado y logging de estadísticas
		this.logProcessingStatistics(rawPlaces.length, basicFiltered.length, selectedPlaces.length, selectedPlaces);

		return selectedPlaces;
	}

	/**
	 * FASE 1: Filtrado Básico
	 */
	private applyBasicFiltering(rawPlaces: FSQRPlace[], searchParams: PlaceSearchParams): FSQRPlace[] {
		this.logger.log('FASE 1: Applying basic filtering');

		const filtered: FSQRPlace[] = [];
		const minRating = 6.5; // default min rating

		for (const place of rawPlaces) {
			// Validar datos mínimos
			if (!this.hasMinimumRequiredData(place)) {
				this.logger.debug(`Discarding place ${place.fsq_place_id} - missing required data`);
				continue;
			}

			// Filtrar por rating
			if (!this.passesRatingFilter(place, minRating)) {
				this.logger.debug(`Discarding place ${place.fsq_place_id} - rating filter failed`);
				continue;
			}

			// Filtrar por disponibilidad
			if (!this.isAvailableForItinerary(place, searchParams)) {
				this.logger.debug(`Discarding place ${place.fsq_place_id} - availability filter failed`);
				continue;
			}

			filtered.push(place);
		}

		return filtered;
	}

	/**
	 * Validar que el lugar tiene datos mínimos requeridos
	 */
	private hasMinimumRequiredData(place: FSQRPlace): boolean {
		// Verificar fsq_place_id
		if (!place.fsq_place_id) {
			return false;
		}

		// Verificar name
		if (!place.name) {
			return false;
		}

		// Verificar coordenadas
		const hasMainGeocode = place.latitude && place.longitude;
		const hasLocationCoords = place.latitude && place.longitude;
		if (!hasMainGeocode && !hasLocationCoords) {
			return false;
		}

		// Verificar categorías
		if (!place.categories || place.categories.length === 0) {
			return false;
		}

		return true;
	}

	/**
	 * Verificar filtro de rating
	 */
	private passesRatingFilter(place: FSQRPlace, minRating: number): boolean {
		if (place.rating === undefined || place.rating === null) {
			// Permitir lugares sin rating pero aplicar penalización después
			return true;
		}

		return place.rating >= minRating;
	}

	/**
	 * Verificar que el lugar tiene fotos
	 */
	private hasPhotos(place: FSQRPlace): boolean {
		return place.photos && place.photos.length > 0;
	}

	/**
	 * Verificar disponibilidad para el itinerario
	 */
	private isAvailableForItinerary(place: FSQRPlace, searchParams: PlaceSearchParams): boolean {
		if (!place.hours) {
			// Si no tiene información de horarios, asumir disponible
			return true;
		}

		// Si tiene horarios, verificar que está abierto
		if (place.hours.open_now !== undefined) {
			return place.hours.open_now;
		}

		// TODO: Implementar lógica más sofisticada para verificar horarios
		// contra date y time_window del searchParams
		return true;
	}

	/**
	 * FASE 2: Enriquecimiento y Cálculos
	 */
	private async enrichAndCalculate(places: FSQRPlace[], searchParams: PlaceSearchParams): Promise<ProcessedPlace[]> {
		this.logger.log('FASE 2: Enriching and calculating scores');

		const enriched: ProcessedPlace[] = [];

		for (const place of places) {
			try {
				const processedPlace = await this.enrichSinglePlace(place, searchParams);
				enriched.push(processedPlace);
			} catch (error) {
				this.logger.warn(`Error enriching place ${place.fsq_place_id}: ${error.message}`);
			}
		}

		return enriched;
	}

	/**
	 * Enriquecer un lugar individual
	 */
	private async enrichSinglePlace(place: FSQRPlace, searchParams: PlaceSearchParams): Promise<ProcessedPlace> {
		// Extraer y normalizar datos básicos
		const location = this.extractLocation(place);
		const category = this.extractPrimaryCategory(place);
		const rating = place.rating || null;
		const priceLevel = this.normalizePriceLevel(place.price);
		const photos = this.extractPhotos(place);
		const description = place.description || '';

		// Calcular distancia si no viene en response
		const distanceFromOrigin = place.distance !== undefined
			? place.distance
			: this.calculateDistance(searchParams.lat, searchParams.lng, location.lat, location.lng);

		// Determinar disponibilidad
		const hours = this.parseHours(place);

		// Calcular score del lugar
		const score = this.calculatePlaceScore(place, searchParams, distanceFromOrigin);

		// Estimar duración de visita
		const estimatedDuration = this.estimateVisitDuration(place, rating);

		// Estimar costo
		const estimatedCost = this.estimateCost(place, priceLevel, category.id);

		return {
			fsq_place_id: place.fsq_place_id,
			name: place.name,
			location,
			category,
			rating,
			price_level: priceLevel,
			photos,
			distance_from_origin: distanceFromOrigin,
			score,
			estimated_cost: estimatedCost,
			estimated_duration: estimatedDuration,
			hours,
			description
		};
	}

	/**
	 * Extraer coordenadas del lugar
	 */
	private extractLocation(place: FSQRPlace): { lat: number; lng: number } {
		if (place.latitude && place.longitude) {
			return {
				lat: place.latitude,
				lng: place.longitude
			};
		}

		if (place.latitude && place.longitude) {
			return {
				lat: place.latitude,
				lng: place.longitude
			};
		}

		throw new Error(`No valid coordinates found for place ${place.fsq_place_id}`);
	}

	/**
	 * Extraer categoría principal
	 */
	private extractPrimaryCategory(place: FSQRPlace): { id: string; name: string } {
		const primaryCategory = place.categories[0];
		return {
			id: primaryCategory.fsq_category_id,
			name: primaryCategory.name
		};
	}

	/**
	 * Normalizar nivel de precio a 1-4
	 */
	private normalizePriceLevel(price?: number): number {
		if (!price || price < 1 || price > 4) {
			return 2; // Default medio
		}
		return Math.round(price);
	}

	/**
	 * Extraer URLs de fotos (primeras 5)
	 */
	private extractPhotos(place: FSQRPlace): string[] {
		if (!place.photos || place.photos.length === 0) {
			return [];
		}

		return place.photos
			.slice(0, 5)
			.map(photo => `${photo.prefix}300x300${photo.suffix}`)
			.filter(url => url && url.length > 0);
	}

	/**
	 * Calcular distancia usando fórmula de Haversine
	 */
	private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
		return Math.round(ScoringUtils.calculateHaversineDistance(lat1, lng1, lat2, lng2) * 1000); // convertir a metros
	}

	/**
	 * Parsear información de horarios
	 */
	private parseHours(place: FSQRPlace): ProcessedPlace['hours'] {
		if (!place.hours) {
			return null;
		}

		return {
			display: place.hours.display || 'Horarios no disponibles',
			is_open: place.hours.open_now || false,
			opening_time: undefined, // TODO: Extraer de regular hours si disponible
			closing_time: undefined   // TODO: Extraer de regular hours si disponible
		};
	}

	/**
	 * Calcular score del lugar (0-100)
	 */
	private calculatePlaceScore(place: FSQRPlace, searchParams: PlaceSearchParams, distance: number): number {
		let score = 0;

		// Rating (35 puntos)
		if (place.rating) {
			score += (place.rating / 10) * 35;
		} else {
			score += 15; // Penalización por no tener rating
		}

		// Relevancia de categoría (25 puntos) - TODO: Mejorar lógica
		score += 20; // Base score for now

		// Proximidad (20 puntos) - Mejor score para lugares más cercanos
		const maxDistance = 10000; // 10km
		const proximityScore = Math.max(0, 20 * (1 - (distance / maxDistance)));
		score += proximityScore;

		// Popularidad/fotos (10 puntos)
		const photoCount = place.photos?.length || 0;
		const popularityScore = Math.min(10, photoCount * 2);
		score += popularityScore;

		// Adecuación de precio (10 puntos)
		const priceLevel = place.price || 2;
		const priceScore = priceLevel <= 3 ? 10 : 5; // Preferir lugares más accesibles
		score += priceScore;

		return Math.min(100, Math.round(score));
	}

	/**
	 * Estimar duración de visita basada en categoría
	 */
	private estimateVisitDuration(place: FSQRPlace, rating: number | null): number {
		const categoryId = place.categories[0]?.fsq_category_id?.toString();

		// Tabla de referencia por categoría (en minutos)
		const baseDurations: { [key: string]: number } = {
			'13065': 90,  // Restaurante
			'13003': 60,  // Café
			'13040': 45,  // Comida rápida
			'10000': 180, // Arte y entretenimiento
			'10001': 240, // Cine
			'10002': 120, // Teatro
			'16000': 150, // Lugar de viaje
			'16001': 180, // Museo
			'16002': 120, // Monumento
			'11000': 150, // Vida nocturna
			'11001': 180, // Bar
			'17000': 120, // Tienda retail
		};

		let duration = baseDurations[categoryId] || 120; // 2 horas por defecto

		// Ajustar por rating alto (+15 min si rating > 9.0)
		if (rating && rating > 9.0) {
			duration += 15;
		}

		// Ajustar por popularidad (+10 min si muchas fotos)
		const photoCount = place.photos?.length || 0;
		if (photoCount > 10) {
			duration += 10;
		}

		return duration;
	}

	/**
	 * Estimar costo basado en price_level y categoría
	 */
	private estimateCost(place: FSQRPlace, priceLevel: number, categoryId: string): number {
		// Multiplicadores base por categoría (MXN)
		const baseCosts: { [key: string]: number } = {
			'13065': 300,  // Restaurante
			'13003': 80,   // Café
			'13040': 150,  // Comida rápida
			'10001': 180,  // Cine
			'16001': 100,  // Museo
			'11001': 200,  // Bar
			'17000': 250,  // Tienda retail
		};

		const baseCost = baseCosts[categoryId] || 200;

		// Multiplicadores por nivel de precio
		const priceMultipliers = [0.5, 1.0, 1.5, 2.5];
		const multiplier = priceMultipliers[priceLevel - 1] || 1.0;

		return Math.round(baseCost * multiplier);
	}

	/**
	 * FASE 3: Selección de Top 50
	 */
	private selectTop50(places: ProcessedPlace[]): ProcessedPlace[] {
		this.logger.log('FASE 3: Selecting top 50 places');

		// Ordenar por score descendente
		const sortedPlaces = [...places].sort((a, b) => b.score - a.score);

		// Aplicar diversificación por categoría
		const diversified = this.applyCategorizationDiversification(sortedPlaces);

		// Verificar cobertura geográfica
		const geographicallyBalanced = this.balanceGeographicDistribution(diversified);

		// Evitar lugares muy cercanos
		const deduplicated = this.removeDuplicateLocations(geographicallyBalanced);

		// Tomar top 50 o menos si no hay suficientes
		const final = deduplicated.slice(0, 50);

		// Validar resultado mínimo
		if (final.length < 5) {
			this.logger.warn(`Only ${final.length} places after selection - minimum viable is 5`);
		}

		return final;
	}

	/**
	 * Aplicar diversificación por categoría (máximo 15 por categoría)
	 */
	private applyCategorizationDiversification(places: ProcessedPlace[]): ProcessedPlace[] {
		const categoryBuckets = new Map<string, ProcessedPlace[]>();

		// Agrupar por categoría
		for (const place of places) {
			const categoryId = place.category.id;
			if (!categoryBuckets.has(categoryId)) {
				categoryBuckets.set(categoryId, []);
			}
			categoryBuckets.get(categoryId)!.push(place);
		}

		// Tomar máximo 15 por categoría
		const diversified: ProcessedPlace[] = [];
		for (const [categoryId, categoryPlaces] of categoryBuckets) {
			const selected = categoryPlaces.slice(0, 15);
			diversified.push(...selected);

			if (categoryPlaces.length > 15) {
				this.logger.debug(`Limited category ${categoryId} from ${categoryPlaces.length} to 15 places`);
			}
		}

		return diversified;
	}

	/**
	 * Balancear distribución geográfica
	 */
	private balanceGeographicDistribution(places: ProcessedPlace[]): ProcessedPlace[] {
		// TODO: Implementar lógica de cuadrantes más sofisticada
		// Por ahora, mantener todos los lugares
		return places;
	}

	/**
	 * Remover lugares muy cercanos (menos de 500m)
	 */
	private removeDuplicateLocations(places: ProcessedPlace[]): ProcessedPlace[] {
		const filtered: ProcessedPlace[] = [];
		const minDistance = 500; // metros

		for (const place of places) {
			const isTooClose = filtered.some(existingPlace => {
				const distance = this.calculateDistance(
					place.location.lat, place.location.lng,
					existingPlace.location.lat, existingPlace.location.lng
				);

				return distance < minDistance && Math.abs(place.score - existingPlace.score) < 10;
			});

			if (!isTooClose) {
				filtered.push(place);
			} else {
				this.logger.debug(`Filtered out ${place.name} - too close to existing place`);
			}
		}

		return filtered;
	}

	/**
	 * FASE 4: Logging de estadísticas de procesamiento
	 */
	private logProcessingStatistics(
		rawTotal: number,
		filteredTotal: number,
		finalTotal: number,
		places: ProcessedPlace[]
	): void {
		// Distribución por categorías
		const categoryDistribution = new Map<string, number>();
		for (const place of places) {
			const category = place.category.name;
			categoryDistribution.set(category, (categoryDistribution.get(category) || 0) + 1);
		}

		// Rango de scores
		const scores = places.map(p => p.score);
		const minScore = Math.min(...scores);
		const maxScore = Math.max(...scores);
		const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

		this.logger.log('=== PROCESSING STATISTICS ===');
		this.logger.log(`Total raw places: ${rawTotal}`);
		this.logger.log(`After basic filtering: ${filteredTotal}`);
		this.logger.log(`Final selection: ${finalTotal}`);
		this.logger.log(`Score range: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)} (avg: ${avgScore.toFixed(1)})`);
		this.logger.log(`Category distribution: ${JSON.stringify(Object.fromEntries(categoryDistribution))}`);
	}
}
