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
		private readonly supabaseStorageService: SupabaseStorageService
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
			distance_to_start: 0,
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

	/** Normaliza HH:MM -> HH:MM:00 (string TIME para SQL) */
  private normalizeTime(hhmm: string): string {
    const [hh, mm] = hhmm.split(':').map(Number);
    const pad = (n: number) => String(n).padStart(2, '0');
    if (
      Number.isNaN(hh) ||
      Number.isNaN(mm) ||
      hh < 0 || hh > 23 ||
      mm < 0 || mm > 59
    ) {
      throw new BadRequestException('Invalid time; expected HH:MM');
    }
    return `${pad(hh)}:${pad(mm)}:00`;
  }

  /** Compara HH:MM sin fecha (usa epoch) */
  private isEndBeforeStart(startHHMM: string, endHHMM: string): boolean {
    const [sh, sm] = startHHMM.split(':').map(Number);
    const [eh, em] = endHHMM.split(':').map(Number);
    return eh < sh || (eh === sh && em < sm);
  }

  async update(
    id: number,
    dto: UpdateActivityDto,                 // <--- ahora usamos el DTO de update
    userId?: number,
  ): Promise<Activity> {
    const activity = await this.findOne(id);

    // Validar ownership a través del itinerary
    if (userId) {
      await this.tripAccessValidator.validateTripOwnershipThroughItinerary(
        activity.itinerary_id,
        userId,
      );
    }

    // Evitar mover de itinerario si alguien lo manda por accidente
    if ((dto as any).itinerary_id !== undefined) {
      delete (dto as any).itinerary_id;
    }

    // Validaciones de tiempo (si vienen)
    if (dto.start_time && !/^\d{2}:\d{2}$/.test(dto.start_time)) {
      throw new BadRequestException('start_time must be HH:MM');
    }
    if (dto.end_time && !/^\d{2}:\d{2}$/.test(dto.end_time)) {
      throw new BadRequestException('end_time must be HH:MM');
    }
    if (dto.start_time && dto.end_time && this.isEndBeforeStart(dto.start_time, dto.end_time)) {
      throw new BadRequestException('end_time must be >= start_time');
    }

    // Armar payload parcial
    const updatePayload: Partial<ActivityAttributes> = {};

    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.start_time !== undefined) updatePayload.start_time = this.normalizeTime(dto.start_time);
    if (dto.end_time !== undefined) updatePayload.end_time = this.normalizeTime(dto.end_time);
    if (dto.budget !== undefined) updatePayload.budget = dto.budget;
    if (dto.transportation_mode !== undefined) updatePayload.transportation_mode = dto.transportation_mode;
    if (dto.sequence !== undefined) updatePayload.sequence = dto.sequence;
    if (dto.transportation_duration !== undefined) updatePayload.transportation_duration = dto.transportation_duration;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes;
    if (dto.img_url !== undefined) updatePayload.img_url = dto.img_url;

    // place -> lat/lng/place
    let shouldUploadNewImageFromPlace = false;
    if (dto.place) {
      updatePayload.place = dto.place;

      // Preferir coords del place si existen; respetar dto.lat/lng si llegaron explícitos
      const latFromPlace =
        (dto.place as any)?.geocodes?.main?.latitude ??
        (dto.place as any)?.location?.lat ??
        (dto.place as any)?.latitude;
      const lngFromPlace =
        (dto.place as any)?.geocodes?.main?.longitude ??
        (dto.place as any)?.location?.lng ??
        (dto.place as any)?.longitude;

      if (updatePayload.lat === undefined && typeof latFromPlace === 'number') {
        updatePayload.lat = latFromPlace;
      }
      if (updatePayload.lng === undefined && typeof lngFromPlace === 'number') {
        updatePayload.lng = lngFromPlace;
      }

      // Si llega foto en el place (como en create), marcamos para regenerar imagen
      const photo = (dto.place as any)?.photos?.[0];
      if (!dto.img_url && photo?.prefix && photo?.suffix) {
        shouldUploadNewImageFromPlace = true;
      }
    }

    // Si vinieron lat/lng sueltos, respetarlos
    if (dto.lat !== undefined) updatePayload.lat = dto.lat;
    if (dto.lng !== undefined) updatePayload.lng = dto.lng;

    // Persistir cambios principales
    await activity.update(updatePayload);

    // Subida opcional de imagen si se envió un place con photo y NO se mandó img_url manual
    if (shouldUploadNewImageFromPlace) {
      try {
        const photo = (dto.place as any).photos[0];
        const photoUrl = photo.prefix + '390x360' + photo.suffix;
        const activityImagePath = this.supabaseStorageService.generateActivityImagePath(activity.id, photoUrl);
        const generatedPhotoURL = await this.supabaseStorageService.uploadImageFromUrl(photoUrl, activityImagePath);
        await activity.update({ img_url: generatedPhotoURL });
      } catch (e) {
        // No rompemos la actualización si falla la imagen; solo avisamos opcionalmente
        // Puedes loggear con tu Logger si lo tienes integrado
      }
    }

    return activity;
  }



}
