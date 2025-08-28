import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FoursquareService {
    private readonly apiUrl = 'https://api.foursquare.com/v3/places/nearby';
    private readonly apiKey: string;

    constructor(private readonly httpService: HttpService, 
        private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('FOURSQUARE_API_KEY');
        if (!apiKey) {
            throw new Error('FOURSQUARE_API_KEY is not defined in environment variables');
        }
       this.apiKey = apiKey;
    }

    async getNearbyPlaces(lat: number, lon: number, query?: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(this.apiUrl, {
                    headers: {
                        Authorization: this.apiKey,
                    },
                    params: {
                        ll: `${lat},${lon}`,   // coordenadas
                        query: query || '',    // opcional, ej. "coffee"
                        radius: 1000,          // en metros
                        limit: 10,             // cuantos resultados
                    },
                }),
            );
            return data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Error fetching data from Foursquare',
                error.response?.status || 500,
            );
        }
    }

    async getTripPhoto(lat: number, lon: number): Promise<string | null> {
        try {
            // 1. Buscar lugares cercanos
            const nearby = await this.getNearbyPlaces(lat, lon);
            if (!nearby.results.length) return null;

            // 2. Tomar el primer lugar
            const place = nearby.results[0];
            const fsqId = place.fsq_id;

            // 3. Buscar fotos del lugar
            const photos = await this.getPlacePhotos(fsqId, 1); // solo 1 foto
            if (!photos.length) return null;

            return photos[0].url; // la URL de la foto
        } catch (error) {
            console.error('Error getting trip photo:', error);
            return null;
        }
    }

    async getPlacePhotos(fsqId: string, limit: number = 3) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(
                    `https://api.foursquare.com/v3/places/${fsqId}/photos`,
                    {
                        headers: { Authorization: this.apiKey },
                        params: { limit },
                    },
                ),
            );

            // Construir las URLs completas
            return data.map(photo => ({
                url: `${photo.prefix}${photo.width}x${photo.height}${photo.suffix}`,
                created_at: photo.created_at,
            }));
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Error fetching photos',
                error.response?.status || 500,
            );
        }
    }
}