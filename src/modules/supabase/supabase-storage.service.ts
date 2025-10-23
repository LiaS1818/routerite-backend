import { Injectable, Logger, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SupabaseStorageService {
	private readonly logger = new Logger(SupabaseStorageService.name);
	private readonly bucketName = 'routerite';

	constructor(
		@Inject('SUPABASE_CLIENT')
		private readonly supabase: SupabaseClient,
		private readonly httpService: HttpService
	) { }

	/**
	 * Descarga una imagen desde una URL externa y la sube a Supabase Storage
	 * @param imageUrl URL de la imagen externa
	 * @param path Ruta donde guardar la imagen en Supabase
	 * @returns URL pública de la imagen en Supabase
	 */
	async uploadImageFromUrl(imageUrl: string, path: string): Promise<string> {
		try {
			this.logger.debug(`Descargando imagen desde: ${imageUrl}`);

			// Descargar la imagen
			const response = await firstValueFrom(
				this.httpService.get(imageUrl, {
					responseType: 'arraybuffer',
					timeout: 10000,
				})
			);

			const imageBuffer = Buffer.from(response.data);
			const contentType = response.headers['content-type'] || 'image/jpeg';

			this.logger.debug(`Imagen descargada, tamaño: ${imageBuffer.length} bytes`);

			// Subir a Supabase Storage
			const { error } = await this.supabase.storage
				.from(this.bucketName)
				.upload(path, imageBuffer, {
					contentType,
					upsert: true, // Sobrescribir si ya existe
				});

			if (error) {
				this.logger.error(`Error subiendo imagen a Supabase: ${error.message}`);
				throw new HttpException(
					'Error uploading image to storage',
					HttpStatus.INTERNAL_SERVER_ERROR
				);
			}

			// Obtener URL pública
			const { data: publicUrlData } = this.supabase.storage
				.from(this.bucketName)
				.getPublicUrl(path);

			this.logger.debug(`Imagen subida exitosamente a: ${publicUrlData.publicUrl}`);
			return publicUrlData.publicUrl;

		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}

			this.logger.error(`Error procesando imagen: ${error.message}`);
			throw new HttpException(
				'Failed to process image upload',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Elimina una imagen del bucket de Supabase
	 * @param path Ruta de la imagen a eliminar
	 */
	async deleteImage(path: string): Promise<void> {
		try {
			const { error } = await this.supabase.storage
				.from(this.bucketName)
				.remove([path]);

			if (error) {
				this.logger.warn(`Error eliminando imagen: ${error.message}`);
			} else {
				this.logger.debug(`Imagen eliminada: ${path}`);
			}
		} catch (error) {
			this.logger.warn(`Error eliminando imagen: ${error.message}`);
		}
	}

	/**
	 * Genera la ruta para guardar la imagen de cobertura de un viaje
	 * @param tripId ID del viaje
	 * @param originalUrl URL original para extraer extensión
	 * @returns Ruta para el archivo
	 */
	generateTripCoverPath(tripId: number, originalUrl: string): string {
		// Extraer extensión de la URL original
		const urlParts = originalUrl.split('.');
		const extension = urlParts[urlParts.length - 1]?.split('?')[0] || 'jpg';

		return `trips/${tripId}/cover.${extension}`;
	}

	/**
	 * Genera la ruta para guardar la imagen de cobertura de un viaje
	 * @param tripId ID del viaje
	 * @param originalUrl URL original para extraer extensión
	 * @returns Ruta para el archivo
	 */
	generateActivityImagePath(activityId: number, originalUrl: string): string {
		// Extraer extensión de la URL original
		const urlParts = originalUrl.split('.');
		const extension = urlParts[urlParts.length - 1]?.split('?')[0] || 'jpg';
		return `activities/${activityId}/cover.${extension}`;
	}

	/**
	 * Sube un archivo .ics a Supabase Storage
	 * @param icsContent Contenido del archivo .ics como string
	 * @param path Ruta donde guardar el archivo en Supabase
	 * @returns URL pública del archivo en Supabase
	 */
	async uploadIcsFile(icsContent: string, path: string): Promise<string> {
		try {
			this.logger.debug(`Subiendo archivo ICS a: ${path}`);

			const icsBuffer = Buffer.from(icsContent, 'utf-8');

			// Subir a Supabase Storage
			const { error } = await this.supabase.storage
				.from(this.bucketName)
				.upload(path, icsBuffer, {
					contentType: 'text/calendar',
					upsert: true, // Sobrescribir si ya existe
				});

			if (error) {
				this.logger.error(`Error subiendo archivo ICS a Supabase: ${error.message}`);
				throw new HttpException(
					'Error uploading ICS file to storage',
					HttpStatus.INTERNAL_SERVER_ERROR
				);
			}

			// Obtener URL pública
			const { data: publicUrlData } = this.supabase.storage
				.from(this.bucketName)
				.getPublicUrl(path);

			this.logger.debug(`Archivo ICS subido exitosamente a: ${publicUrlData.publicUrl}`);
			return publicUrlData.publicUrl;

		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}

			this.logger.error(`Error procesando archivo ICS: ${error.message}`);
			throw new HttpException(
				'Failed to process ICS file upload',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Genera la ruta para guardar el archivo .ics de un viaje
	 * @param tripId ID del viaje
	 * @returns Ruta para el archivo
	 */
	generateTripIcsPath(tripId: number): string {
		return `trips/${tripId}/itinerary.ics`;
	}
}
