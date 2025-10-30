import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Activity, Itinerary, Trip, User } from 'src/database/models';
import { CreateActivityDto } from './dto/create-activity.dto';
import { cast, col, literal, Op, WhereOptions, where } from 'sequelize';
import { TripAccessValidatorService } from '../../common/services/trip-access-validator.service';
import { ActivityAttributes } from '../../database/models/activity.model';
import { SupabaseStorageService } from '../supabase/supabase-storage.service';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { FoursquareMockService } from '../../common/services/foursquare/foursquare-mock.service';
import { FSQRPlace } from '../../common/interfaces/FSQRPlace.interface';
import { ConfigService } from '@nestjs/config';
import fsqDevelopersPlaces from '@api/fsq-developers-places';

@Injectable()
export class ActivityService {
	constructor(
		@InjectModel(Trip)
		private readonly tripModel: typeof Trip,
		@InjectModel(Activity)
		private readonly activityModel: typeof Activity,
		@InjectModel(Itinerary)
		private readonly itineraryModel: typeof Itinerary,

		private readonly tripAccessValidator: TripAccessValidatorService,
		private readonly supabaseStorageService: SupabaseStorageService,
		private readonly foursquareMockService: FoursquareMockService,
		private readonly configService: ConfigService,
	) {}	

	async create(
		createActivityDto: CreateActivityDto,
		userId?: number
	): Promise<Activity> {
		// Validate ownership for creation
		if (userId) {
			await this.tripAccessValidator.validateTripOwnershipThroughItinerary(
				createActivityDto.itinerary_id,
				userId
			);
		}

		let { place, ...restOfActivity } = createActivityDto;
		const photo = place.photos[0];

		// Obtener el siguiente valor de sequence para el itinerary
		const lastActivity = await this.activityModel.findOne({
			where: { itinerary_id: createActivityDto.itinerary_id },
			order: [['sequence', 'DESC']]
		});
		const nextSequence = lastActivity?.sequence ? lastActivity.sequence + 1 : 1;

		let activity = {
			...restOfActivity,
			lat: place.latitude,
			lng: place.longitude,
			place,
			distance_to_start: place.distance,
			transportation_mode: "auto",
			sequence: nextSequence
		}

		const createdAct = await this.activityModel.create(activity);
		const photoUrl = photo.prefix + "390x360" + photo.suffix;

		// Update photo to supabase
		const activityImagePath = this.supabaseStorageService.generateActivityImagePath(createdAct.id, photoUrl);
		const generatedPhotoURL = await this.supabaseStorageService.uploadImageFromUrl(photoUrl, activityImagePath);
		await createdAct.update({ img_url: generatedPhotoURL });

		return createdAct;
	}

	async findAllByItinerary(itineraryId): Promise<Activity[]> {
		return await this.activityModel.findAll({
			where: { itinerary_id: itineraryId },
			order: [['sequence', 'ASC']]
		});
	}

	async findOne(id: number, userId?: number): Promise<Activity> {
		const activity = await this.activityModel.findByPk(id);
		if (!activity) {
			throw new NotFoundException(`Activity with ID ${id} not found`);
		}

		// Validate access through itinerary
		if (userId) {
			await this.tripAccessValidator.validateTripAccessThroughItinerary(
				activity.itinerary_id,
				userId
			);
		}

		return activity;
	}

	async remove(id: number, userId?: number): Promise<void> {
		const activity = await this.findOne(id);

		// Validate ownership for deletion
		if (userId) {
			await this.tripAccessValidator.validateTripOwnershipThroughItinerary(
				activity.itinerary_id,
				userId
			);
		}

		await activity.destroy();
	}

	async findByTripDate(tripId: number, date: string, userId: number) {
		const tz = 'America/Mexico_City';
	return this.activityModel.findAll({
		attributes: { exclude: ['itinerary_id'] },
		include: [
			{
				model: this.itineraryModel,
				as: 'itinerary',
				required: true,                 // INNER JOIN
				where: {
				trip_id: tripId,
				[Op.and]: literal(`(itinerary.date AT TIME ZONE 'America/Mexico_City')::date = DATE '${date}'`)
				},
				attributes: ['id', 'date', 'trip_id'],
				include: [
				{
					model: this.tripModel,
					as: 'trip',
					required: true,             // INNER JOIN
					where: { user_id: userId },
					attributes: ['id', 'user_id', 'destination'],
				},
				],
			},
			],
			order: [['start_time', 'ASC']],
			subQuery: false,                    // fuerza JOIN directo (evita subconsulta)
		});
	}

	private normalizeTime(hhmm: string): string {
    const [hh, mm] = hhmm.split(':').map(Number);
    const pad = (n: number) => String(n).padStart(2, '0');
    if (
      Number.isNaN(hh) || Number.isNaN(mm) ||
      hh < 0 || hh > 23 || mm < 0 || mm > 59
    ) {
      throw new BadRequestException('Invalid time; expected HH:MM');
    }
    return `${pad(hh)}:${pad(mm)}:00`;
  }

  private endIsBeforeStart(startHHMM: string, endHHMM: string): boolean {
    const [sh, sm] = startHHMM.split(':').map(Number);
    const [eh, em] = endHHMM.split(':').map(Number);
    return eh < sh || (eh === sh && em < sm);
  }

  async update(
    id: number,
    dto: UpdateActivityDto,
    userId?: number,
  ): Promise<Activity> {
    const activity = await this.findOne(id);

    // Validación de ownership para update
    if (userId) {
      await this.tripAccessValidator.validateTripOwnershipThroughItinerary(
        activity.itinerary_id,
        userId,
      );
    }

    // Si por error llega itinerary_id, lo ignoramos
    if ((dto as any).itinerary_id !== undefined) {
      delete (dto as any).itinerary_id;
    }

    // Validación de tiempos (si vienen)
    if (dto.start_time && !/^\d{2}:\d{2}$/.test(dto.start_time)) {
      throw new BadRequestException('start_time must be HH:MM');
    }
    if (dto.end_time && !/^\d{2}:\d{2}$/.test(dto.end_time)) {
      throw new BadRequestException('end_time must be HH:MM');
    }
    if (dto.start_time && dto.end_time && this.endIsBeforeStart(dto.start_time, dto.end_time)) {
      throw new BadRequestException('end_time must be >= start_time');
    }

    const updatePayload: Partial<ActivityAttributes> = {};

    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.start_time !== undefined) updatePayload.start_time = this.normalizeTime(dto.start_time);
    if (dto.end_time !== undefined) updatePayload.end_time = this.normalizeTime(dto.end_time);
    if (dto.budget !== undefined) updatePayload.budget = dto.budget;

    // place => sincroniza place + lat/lng
    let shouldUploadNewImageFromPlace = false;
    if (dto.place) {
      updatePayload.place = dto.place;

      const latFromPlace =
        (dto.place as any)?.geocodes?.main?.latitude ??
        (dto.place as any)?.location?.lat ??
        (dto.place as any)?.latitude;

      const lngFromPlace =
        (dto.place as any)?.geocodes?.main?.longitude ??
        (dto.place as any)?.location?.lng ??
        (dto.place as any)?.longitude;

      if (typeof latFromPlace === 'number') updatePayload.lat = latFromPlace;
      if (typeof lngFromPlace === 'number') updatePayload.lng = lngFromPlace;

      // Si el place trae foto, regeneramos img_url como en create
      const photo = (dto.place as any)?.photos?.[0];
      if (photo?.prefix && photo?.suffix) {
        shouldUploadNewImageFromPlace = true;
      }
    }

    // Guardar cambios principales
    await activity.update(updatePayload);

    // Subir imagen a Supabase si aplica (igual que en create)
    if (shouldUploadNewImageFromPlace) {
      try {
        const photo = (dto.place as any).photos[0];
        const photoUrl = photo.prefix + '390x360' + photo.suffix;
        const activityImagePath = this.supabaseStorageService.generateActivityImagePath(activity.id, photoUrl);
        const generatedPhotoURL = await this.supabaseStorageService.uploadImageFromUrl(photoUrl, activityImagePath);
        await activity.update({ img_url: generatedPhotoURL });
      } catch {
        // Si falla la imagen, no rompemos la actualización
      }
    }

    return activity;
  }

	/**
	 * Obtiene candidatos para reemplazar una actividad
	 * Busca lugares cercanos usando Foursquare con las mismas categorías (si existen)
	 */
	async getReplacementCandidates(
		activityId: number,
		userId?: number,
	): Promise<FSQRPlace[]> {
		// Obtener la actividad y validar acceso
		const activity = await this.findOne(activityId, userId);

		// Extraer coordenadas
		const { lat, lng, place } = activity;

		// Extraer categorías si existen
		const categories = place?.categories?.map(cat => cat.fsq_category_id) || [];

		// Determinar qué servicio usar (mock o real)
		const fsqrApiKey = this.configService.get<string>('FSQR_API_KEY') || ' ';
		const useFSQRMock = this.configService.get('USE_FSQR_MOCK', true);
		const fsqrService = useFSQRMock !== 'false' ? this.foursquareMockService : fsqDevelopersPlaces;

		// Autenticar
		fsqrService.auth(fsqrApiKey);

		// Construir parámetros de búsqueda
		const searchParams: any = {
			ll: `${lat},${lng}`,
			radius: 3000, // 3 km en metros
			limit: 20, // Traer hasta 20 candidatos
			fields: 'fsq_place_id,name,description,distance,price,rating,tel,website,social_media,latitude,longitude,categories,hours,location,stats,photos',
			sort: 'DISTANCE', // Ordenar por distancia
			'X-Places-Api-Version': '2025-06-17',
		};

		// Agregar categorías si existen
		if (categories.length > 0) {
			searchParams.fsq_category_ids = categories.join(',');
		}

		// Buscar lugares cercanos
		const response = await fsqrService.placeSearch(searchParams);
		//@ts-ignore
		const candidates: FSQRPlace[] = response.data?.results || [];
		// Filtrar lugares que estén abiertos actualmente si aplica
		const openCandidates = candidates.filter(
			candidate => candidate.hours?.open_now === true
		);

		// Si hay lugares abiertos, devolverlos; si no, devolver todos los candidatos
		return openCandidates.length > 0 ? openCandidates : candidates;
	}

	/**
	 * Reemplaza el lugar de una actividad con un nuevo lugar de Foursquare
	 */
	async replacePlace(
		activityId: number,
		newPlace: FSQRPlace,
		userId?: number,
	): Promise<Activity> {
		// Obtener la actividad y validar ownership
		const activity = await this.findOne(activityId, userId);

		if (userId) {
			await this.tripAccessValidator.validateTripOwnershipThroughItinerary(
				activity.itinerary_id,
				userId,
			);
		}

		// Preparar datos de actualización
		const updatePayload: Partial<ActivityAttributes> = {
			name: newPlace.name,
			description: newPlace.description,
			place: newPlace,
			lat: newPlace.latitude,
			lng: newPlace.longitude,
		};

		// Actualizar actividad con los nuevos datos
		await activity.update(updatePayload);

		// Actualizar imagen si el nuevo lugar tiene fotos
		const photo = newPlace.photos?.[0];
		if (photo?.prefix && photo?.suffix) {
			try {
				const photoUrl = photo.prefix + '390x360' + photo.suffix;
				const activityImagePath = this.supabaseStorageService.generateActivityImagePath(
					activity.id,
					photoUrl,
				);
				const generatedPhotoURL = await this.supabaseStorageService.uploadImageFromUrl(
					photoUrl,
					activityImagePath,
				);
				await activity.update({ img_url: generatedPhotoURL });
			} catch (error) {
				// Si falla la imagen, no rompemos la actualización
				console.error('Error uploading new activity image:', error);
			}
		}

		return activity;
	}

}