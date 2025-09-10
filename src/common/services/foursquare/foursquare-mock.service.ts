import {
	Injectable,
	NotFoundException,
	// ForbiddenException, // Remove unused import
	Logger,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import {
	PlaceDetailsMetadataParam,
	PlaceSearchMetadataParam,
} from '../../../../.api/apis/fsq-developers-places';
import type * as types from '../../../../.api/apis/fsq-developers-places/types';
import { FSQRPlace } from '../../interfaces/FSQRPlace.interface';


type FilterParams = {
	/** ids de categorias de Foursquare; acepta string o number */
	categoryIds?: Array<string | number>;
	/** rating minimo (0-10 Foursquare) */
	minRating?: number;
	/** solo lugares abiertos ahora */
	openNow?: boolean;
	/** ordenar por rating desc */
	sortByRatingDesc?: boolean;
};

interface FetchResponse<T, U> {
	status: T;
	data: U;
}

@Injectable()
export class FoursquareMockService {
	private readonly logger = new Logger(FoursquareMockService.name);

	constructor() {}

	private readonly fields = "fsq_place_id,name,description,distance,price,rating,social_media,tel,website,categories,hours,location,photos,related_places,stats,latitude,longitude".split(",");
	private places: any[] = [];

	private loadPlacesJSON() {
		const fileContent= fs.readFileSync('assets/places.json', 'utf-8')
		const parsed = JSON.parse(fileContent);
		this.places = parsed.results.map((place: any) => {
			return {
				fsq_place_id: "mock-place-id",
				...place
			}
		})
		this.logger.log("Places loaded")
	}

	auth(token): void {
		this.loadPlacesJSON();
	}

	async placeSearch(
		params: PlaceSearchMetadataParam
	): Promise<FetchResponse<200, types.PlaceSearchResponse200>> {
		if (!this.places.length)
			throw new NotFoundException('Missing auth token, call auth first');

		let { limit = 10, query } = params;

		const places: FSQRPlace[] = [];
		const indexes: number[] = [];

		if(query) {
			const place = this.places.find(place => place.name.toLowerCase().includes(query.toLowerCase()));
			if(place) {
				places.push(place)
				indexes.push(this.places.indexOf(place))
				limit -= 1;
			}
		}

		// Generate n - non repeating random indexes
		while (indexes.length < limit) {
			const randomIndex = Math.floor(Math.random() * this.places.length);
			if (!indexes.includes(randomIndex)) {
				indexes.push(randomIndex);
				places.push(this.places[randomIndex]);
			}
		}
		return {
			data: {
				// @ts-ignore
				results: places,
				context: {
					geo_bounds: {
						circle: {
							center: {
								latitude: 20.6741723190878,
								longitude: -103.3481057748364,
							},
							radius: 12000,
						},
					},
				},
			},
			status: 200,
		};
	}

	async placeDetails(params: PlaceDetailsMetadataParam): Promise<FetchResponse<200, types.PlaceDetailsResponse200>> {
		if(!this.places.length) throw new NotFoundException("Missing auth token, call auth first")

		let { fsq_place_id } = params;
		if(!fsq_place_id) throw new NotFoundException("Missing fsq_place_id")

		const place = this.places.find(place => place.fsq_place_id === fsq_place_id);
		if(!place) throw new NotFoundException("Place not found")

		return {
			data: place,
			status: 200
		}
	}

	async getRandomPlace(): Promise<FSQRPlace> {
		if(!this.places.length) throw new NotFoundException("Missing auth token, call auth first")
		const placesWithHours = this.places.filter(place => place.hours && place.hours.regular && place.hours.regular.length > 0);
		return placesWithHours[Math.floor(Math.random() * placesWithHours.length)];
		// return this.places[Math.floor(Math.random() * this.places.length)];
	}

	// --- helper: haversine (m) ---
	private haversineMeters(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	): number {
		const R = 6371000;
		const toRad = (d: number) => (d * Math.PI) / 180;
		const dLat = toRad(lat2 - lat1);
		const dLon = toRad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(toRad(lat1)) *
				Math.cos(toRad(lat2)) *
				Math.sin(dLon / 2) ** 2;
		return 2 * R * Math.asin(Math.sqrt(a));
	}

	// --- helper: parse ll "lat,lng" ---
	private parseLL(ll?: string): { lat: number; lng: number } | null {
		if (!ll || typeof ll !== 'string') return null;
		const [latS, lngS] = ll.split(',');
		const lat = Number(latS);
		const lng = Number(lngS);
		return Number.isFinite(lat) && Number.isFinite(lng)
			? { lat, lng }
			: null;
	}

	// --- mapeador al formato requerido ---
	private mapToClientPlace(
		p: any,
		originLL: { lat: number; lng: number } | null
	) {
		const mainGeo = p?.geocodes?.main || p?.geocodes?.drop_off || null;
		const dist =
			originLL && mainGeo?.latitude && mainGeo?.longitude
				? Math.round(
						this.haversineMeters(
							originLL.lat,
							originLL.lng,
							Number(mainGeo.latitude),
							Number(mainGeo.longitude)
						)
					)
				: null;

		const cats = Array.isArray(p?.categories) ? p.categories : [];
		const photos = Array.isArray(p?.photos) ? p.photos : [];

		return {
			fsq_id: p?.fsq_id ?? null,
			name: p?.name ?? null,
			description:
				p?.description ?? p?.location?.formatted_address ?? null,
			distance: dist, // metros desde ll
			price: p?.price?.tier ?? p?.price ?? null, // soporta price.tier o price plano
			rating: typeof p?.rating === 'number' ? p.rating : null,
			social_media: p?.social_media ?? {},
			tel: p?.tel ?? p?.phone ?? null,
			website: p?.website ?? p?.link ?? null,
			categories: cats.map((c: any) => ({
				id: c?.id ?? c?.fsq_category_id ?? c?.category_id ?? null,
				name: c?.name ?? null,
				short_name: c?.short_name ?? null,
				plural_name: c?.plural_name ?? null,
				icon: c?.icon ?? null,
			})),
			geocodes: p?.geocodes ?? null,
			hours: p?.hours
				? {
						display: p.hours.display ?? null,
						is_local_holiday: !!p.hours.is_local_holiday,
						open_now: !!(p.hours.is_open ?? p.hours.open_now),
						regular: p.hours.regular ?? [],
					}
				: null,
			location: p?.location ?? null,
			photos: photos.map((ph: any) => ({
				id: ph?.id ?? null,
				created_at: ph?.created_at ?? null,
				prefix: ph?.prefix ?? null,
				suffix: ph?.suffix ?? null,
				width: ph?.width ?? null,
				height: ph?.height ?? null,
			})),
			related_places: p?.related_places ?? null,
		};
	}

	private ensureLoaded(): void {
		if (!this.places.length) {
			this.loadPlacesJSON();
		}
	}

	private norm(s?: string): string {
		return (s ?? '')
			.toLowerCase()
			.normalize('NFD') // separate accents
			.replace(/\p{Diacritic}/gu, ''); // remove accents
	}

	private matchesFilters(

		
		p: any,
		{
		  catSet,
		  minRating,
		  textQuery,
		  minPrice,
		  maxPrice,
		}: {
		  catSet?: Set<string>;
		  minRating?: number;
		  textQuery?: string;   // ya normalizado
		  minPrice?: number;    // 1..5
		  maxPrice?: number;    // 1..5
		}
	  ): boolean {
		let ok = true;
	  
		// 1) Categorías por id (si aplica)
		if (ok && catSet && Array.isArray(p.fsq_category_ids) && p.fsq_category_ids.length) {
		  ok = p.fsq_category_ids.some((c: any) => catSet.has(String(c)));
		}
	  
		// 2) Rating mínimo
		if (ok && typeof minRating === 'number') {
		  ok = typeof p.rating === 'number' && p.rating >= minRating;
		}
	  
		// 3) Filtro por precio (niveles 1..5)
		if (ok && (typeof minPrice === 'number' || typeof maxPrice === 'number')) {
		  const lvl = typeof p.price === 'number' ? p.price : undefined;
		  // Si no hay price en el item, lo excluimos cuando hay filtro de precio
		  if (typeof lvl !== 'number') return false;
	  
		  const lo = typeof minPrice === 'number' ? minPrice : 1;
		  const hi = typeof maxPrice === 'number' ? maxPrice : 5;
		  ok = lvl >= lo && lvl <= hi;
		}
	  
		// 4) Búsqueda de texto (OR sobre name, description, categories)
		if (ok && textQuery) {
		  const q = textQuery;
	  
		  const nName = this.norm(p.name);
		  const nDesc = this.norm(p.description);
		  const inName = nName.includes(q);
		  const inDesc = nDesc.includes(q);
	  
		  let inCats = false;
		  if (Array.isArray(p.categories)) {
			inCats = p.categories.some((c: any) => {
			  const n1 = this.norm(c?.name);
			  const n2 = this.norm(c?.short_name);
			  const n3 = this.norm(c?.plural_name);
			  return n1.includes(q) || n2.includes(q) || n3.includes(q);
			});
		  }
	  
		  ok = inName || inDesc || inCats;
		}
	  
		return ok;
	  }

	  async placeSearchFiltered(
		params: PlaceSearchMetadataParam & FilterParams & {
		  name?: string;        // 🔹 nuevo: texto libre
		  minPrice?: number;    // 🔹 nuevo: nivel 1..5
		  maxPrice?: number;    // 🔹 nuevo: nivel 1..5
		}
	  ): Promise<FetchResponse<200, types.PlaceSearchResponse200>> {
		this.ensureLoaded();
	  
		const {
		  categoryIds,
		  minRating,
		  sortByRatingDesc = true,
		  name,
		  minPrice,
		  maxPrice,
		} = params;
	  
		// limit seguro
		const rawLimit = (params as any)?.limit;
		const lim = Number.isFinite(+rawLimit)
		  ? Math.max(0, Math.floor(+rawLimit))
		  : 10;
	  
		// origen para distancia (si viene)
		const originLL = this.parseLL((params as any)?.ll);
	  
		// normaliza ids
		const catSet =
		  categoryIds && categoryIds.length
			? new Set(categoryIds.map((c: string | number) => String(c)))
			: undefined;
	  
		// 🔹 normaliza el texto de búsqueda
		const textQuery = name && name.trim().length ? this.norm(name) : undefined;
	  
		// 🔹 clamp de price level a 1..5 si vienen valores “raros” (p.ej. 500)
		const clampLvl = (v?: number) =>
		  typeof v === 'number' ? Math.min(5, Math.max(1, Math.floor(v))) : undefined;
	  
		const loPrice = clampLvl(minPrice);
		const hiPrice = clampLvl(maxPrice);
	  
		// Si el usuario pasó 500, esto terminará como 5
		// y si pasó 0 o negativo, terminará como 1.
	  
		let filtered: FSQRPlace[] = this.places.filter((p: any) =>
		  this.matchesFilters(p, {
			catSet,
			minRating,
			textQuery,
			minPrice: loPrice,
			maxPrice: hiPrice,
		  })
		);
	  
		if (sortByRatingDesc) {
		  filtered.sort((a: any, b: any) => {
			const ra = typeof a.rating === 'number' ? a.rating : -1;
			const rb = typeof b.rating === 'number' ? b.rating : -1;
			return rb - ra;
		  });
		}
	  
		// aplica limite
		const limited = filtered.slice(0, lim);
	  
		// mapea al formato requerido
		const results = limited.map((p: any) => this.mapToClientPlace(p, originLL));
	  
		this.logger.debug(
		  `placeSearchFiltered: filtered=${filtered.length} limit=${lim} returned=${results.length}`
		);
	  
		return {
		  data: {
			// @ts-ignore
			results,
			context: {
			  geo_bounds: {
				circle: {
				  center: {
					latitude: 20.6741723190878,
					longitude: -103.3481057748364,
				  },
				  radius: 12000,
				},
			  },
			},
		  },
		  status: 200,
		};
	  }

	async autocomplete(query: string, limit = 50): Promise<FSQRPlace[]> {
		this.ensureLoaded();

		if (!query || query.trim().length === 0) return [];

		// --- helpers ---
		const norm = (s?: string) =>
			(s ?? '')
				.toLowerCase()
				.normalize('NFD') // separa acentos
				.replace(/\p{Diacritic}/gu, ''); // quita acentos

		const q = norm(query);

		const scored = this.places
			.map((p: FSQRPlace, i: number) => {
				const nName = norm(p.name);
				const nDesc = norm(p.description);
				const nAddr = norm(p.location?.formatted_address);
				const nLocal = norm(p.location?.locality);
				const nRegion = norm(p.location?.region);

				const matchName = nName.includes(q);
				const matchDesc = q.length > 2 && nDesc.includes(q); // baja prioridad
				const matchAddr =
					q.length > 2 &&
					(nAddr.includes(q) ||
						nLocal.includes(q) ||
						nRegion.includes(q));

				const matchCategory =
					Array.isArray(p.categories) &&
					p.categories.some(
						c =>
							norm(c?.name).includes(q) ||
							norm(c?.short_name).includes(q)
					);

				const matched =
					matchName || matchCategory || matchDesc || matchAddr;

				// Pondera: nombre > categoría > dirección/desc
				const score =
					(matchName ? 4 : 0) +
					(matchCategory ? 2 : 0) +
					(matchAddr ? 1 : 0) +
					(matchDesc ? 1 : 0) +
					// pequeño boost si empieza por el prefijo
					(nName.startsWith(q) ? 1 : 0);

				// Clave única para dedupe: fsq_id o fallback estable
				const key =
					(p.fsq_id && `fsq:${p.fsq_id}`) ||
					(p.name && p.location?.formatted_address
						? `nm:${p.name}|addr:${p.location.formatted_address}`
						: `idx:${i}`); // último recurso

				return { p, matched, score, key };
			})
			.filter(x => x.matched)
			.sort((a, b) => b.score - a.score)
			.slice(0, Math.max(limit * 3, limit)); // deja pasar un colchón antes del dedupe

		// --- dedupe ---
		const seen = new Set<string>();
		const deduped: FSQRPlace[] = [];
		for (const { p, key } of scored) {
			if (!seen.has(key)) {
				seen.add(key);
				deduped.push(p);
				if (deduped.length >= limit) break;
			}
		}

		return deduped;
	}
}

