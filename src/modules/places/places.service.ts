import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { FsqPlace } from './interfaces/fsq-place';
import { SearchPlacesDto } from './dto/filters-place.dto';
import { haversineMeters } from './utils/haversine';
import { isOpenAt } from './utils/open-at';
import { SortEnum } from './enums/sort.enums'

@Injectable()
export class PlacesService {
  private places: FsqPlace[];

  constructor() {
    const p = path.resolve(process.cwd(), 'assets/places_mock.json');
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    // el archivo tiene un objeto { results: [...] }
    this.places = Array.isArray(raw.results) ? raw.results : [];
  }

  search(params: SearchPlacesDto) {
    const {
      ll, radius, ne, sw, query, categories, sort = SortEnum.RELEVANCE, open_at, limit, /* near, fields */
    } = params;

    // Parse ubicación
    const center = ll ? strToLatLng(ll) : undefined;
    const rad = radius ? Number(radius) : undefined;
    const bbox = (ne && sw) ? { ne: strToLatLng(ne), sw: strToLatLng(sw) } : undefined;

    // Pre-categorías
    const wantCats = categories
      ? categories.split(',').map(x => x.trim().toLowerCase()).filter(Boolean)
      : [];

    // Paso 1: filtro geográfico
    let rows = this.places.filter(p => {
      // tu mock NO tiene lat/lng
      const lat = p.location?.lat;
      const lng = p.location?.lng;
      const hasDistance = typeof p.distance === 'number';

      // si hay lat/lng, usamos haversine
      if (typeof lat === 'number' && typeof lng === 'number' && center && rad != null) {
        const d = haversineMeters(center, { lat, lng });
        (p as any).__distance = d;
        if (d > rad) return false;
      }
      // si no hay coordenadas, pero sí "distance", usamos ese campo
      else if (hasDistance && rad != null) {
        if (p.distance > rad) return false;
        (p as any).__distance = p.distance;
      }
      // si no hay ni lat/lng ni distance, lo dejamos pasar
      else {
        (p as any).__distance = undefined;
      }

      return true;
    });


    // Paso 2: filtro por texto
    if (query?.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(p => {
        const name = p.name?.toLowerCase() ?? '';
        const addr = (p.location?.address ?? '').toLowerCase();
        const locality = (p.location?.locality ?? '').toLowerCase();
        const catNames = (p.categories ?? []).map(c => c.name?.toLowerCase() ?? '');
        return (
          name.includes(q) ||
          addr.includes(q) ||
          locality.includes(q) ||
          catNames.some(cn => cn.includes(q))
        );
      });
    }

    // Paso 3: filtro por categorías
    if (wantCats.length) {
      rows = rows.filter(p => {
        const ids = (p.categories ?? []).map(c => String(c.fsq_category_id ?? '').toLowerCase());
        const names = (p.categories ?? []).map(c => (c.name ?? '').toLowerCase());
        return wantCats.some(w => ids.includes(w) || names.includes(w));
      });
    }

    // Paso 4: filtro Open At
    if (open_at) {
      rows = rows.filter(p => isOpenAt(p, open_at));
    }

    // Scoring simple para RELEVANCE (texto + cercanía + rating/popularity opcional)
    const hasQuery = !!(query && query.trim());
    rows = rows.map(p => {
      let score = 0;
      if (hasQuery) {
        const q = query!.trim().toLowerCase();
        const name = p.name?.toLowerCase() ?? '';
        const catNames = (p.categories ?? []).map(c => c.name?.toLowerCase() ?? '');
        if (name.includes(q)) score += 3;
        if (catNames.some(cn => cn.includes(q))) score += 1.5;
      }
      if ((p as any).__distance != null) {
        // más cerca = mejor
        const d = (p as any).__distance as number;
        score += (d > 0) ? 1 / (1 + d / 100) : 2; // 0m ≈ +2
      }
      if (typeof p.rating === 'number') score += p.rating * 0.2;
      if (typeof (p as any).popularity === 'number') score += (p as any).popularity * 0.1;
      (p as any).__relevance = score;
      return p;
    });

    // Paso 5: ordenamiento
    rows.sort((a, b) => {
      switch (sort) {
        case SortEnum.RATING:
          return (b.rating ?? -Infinity) - (a.rating ?? -Infinity);
        case SortEnum.DISTANCE:
          return ((a as any).__distance ?? Infinity) - ((b as any).__distance ?? Infinity);
        case SortEnum.POPULARITY:
          return ((b as any).popularity ?? -Infinity) - ((a as any).popularity ?? -Infinity);
        case SortEnum.RELEVANCE:
        default:
          return ((b as any).__relevance ?? 0) - ((a as any).__relevance ?? 0);
      }
    });

    // Paso 6: limitar y limpiar campos internos
    const lim = limit ? Number(limit) : undefined;
    const out = (lim ? rows.slice(0, lim) : rows).map(({ ...p }) => {
      delete (p as any).__distance;
      delete (p as any).__relevance;
      return p;
    });

    return out;
  }
}

function strToLatLng(s: string) {
  const [lat, lng] = s.split(',').map(Number);
  return { lat, lng };
}
