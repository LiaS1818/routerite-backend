import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { FsqPlace } from './interfaces/fsq-place';
import { SearchPlacesDto } from './dto/filters-place.dto';
import { haversineMeters } from './utils/haversine';
import { isOpenAt } from './utils/open-at';
import { SortEnum } from './enums/sort.enums'
import fsqDevelopersPlaces from '@api/fsq-developers-places';
import { ConfigService } from '@nestjs/config';
import { FoursquareMockService } from '../../common/services/foursquare/foursquare-mock.service';

@Injectable()
export class PlacesService {
  private places: FsqPlace[];

  constructor(
	  private readonly configService: ConfigService,
	  private fsqDevelopersPlaces: FoursquareMockService
  ) {
  }

  async search(params: SearchPlacesDto) {
    const {
    	ll,
		radius,
		query,
		categories,
		sort = SortEnum.RELEVANCE,
		open_at,
		limit
    } = params;

	console.log('params', params)

    const rad = radius ? Number(radius) : undefined;
    // Pre-categorías
    const wantCats = categories
      ? categories.split(',').map(x => x.trim().toLowerCase()).filter(Boolean)
      : [];

	  // Asegurar autenticación del mock service
	  const fsqrApiKey = this.configService.get<string>('FSQR_API_KEY') || " ";
	  const useFSQRMock = this.configService.get('USE_FSQR_MOCK', true);
	  const fsqrService =  useFSQRMock != "false"  ? this.fsqDevelopersPlaces : fsqDevelopersPlaces;

	  fsqrService.auth(fsqrApiKey);
	  const placesResponse = await fsqrService.placeSearch({
		  query: query?.trim() || undefined,
		  ll,
		  radius: rad,
		  fsq_category_ids: wantCats.join(","),
		  open_at: open_at || undefined,
		  fields: "fsq_place_id,name,description,photos,price,distance,rating,tel,website,social_media,latitude,longitude,categories,hours,location,stats",
		  // @ts-ignore
		  sort,
		  'X-Places-Api-Version': '2025-06-17'
	  })

	  const places = placesResponse.data.results || [];
	  return places;
  }
}


