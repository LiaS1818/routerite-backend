import {
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Activity, Itinerary, Trip, User } from 'src/database/models';
import { CreateActivityDto } from './dto/create-activity.dto';
import { WhereOptions } from 'sequelize';
import { TripAccessValidatorService } from '../../common/services/trip-access-validator.service';
import { ActivityAttributes } from '../../database/models/activity.model';
import { SupabaseStorageService } from '../supabase/supabase-storage.service';

@Injectable()
export class ActivityService {
	constructor(
		@InjectModel(Activity)
		private readonly activityModel: typeof Activity,
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
		let activity = {
			...restOfActivity,
			lat: place.latitude,
			lng: place.longitude,
			place,
			distance_to_start: 0,
			transportation_mode: "auto"
		}

		const createdAct = await this.activityModel.create(activity);
		const photoUrl = photo.prefix + "390x360" + photo.suffix;

		// Update photo to supabase
		const activityImagePath = this.supabaseStorageService.generateActivityImagePath(createdAct.id, photoUrl);
		const generatedPhotoURL = await this.supabaseStorageService.uploadImageFromUrl(photoUrl, activityImagePath);
		await createdAct.update({ img_url: generatedPhotoURL });

		return createdAct;
	}

	async findAll(): Promise<Activity[]> {
		return this.activityModel.findAll();
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

	async findByItinerary(
		itineraryId: number,
		userId?: number
	): Promise<Activity[]> {
		// Validate access to itinerary
		if (userId) {
			await this.tripAccessValidator.validateTripAccessThroughItinerary(
				itineraryId,
				userId
			);
		}

		return this.activityModel.findAll({
			where: { itinerary_id: itineraryId } as WhereOptions<Activity>,
			order: [['created_at', 'ASC']],
		});
	}
}
