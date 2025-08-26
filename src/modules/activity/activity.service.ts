import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Activity } from 'src/database/models';
import { CreateActivityDto } from './dto/create-activity.dto';
import { WhereOptions } from 'sequelize';

@Injectable()
export class ActivityService {
	constructor(
		@InjectModel(Activity)
		private readonly activityModel: typeof Activity
	) {}

	async create(createActivityDto: CreateActivityDto): Promise<Activity> {
		return this.activityModel.create(createActivityDto);
	}

	async findAll(): Promise<Activity[]> {
		return this.activityModel.findAll();
	}

	async findOne(id: number): Promise<Activity> {
		const activity = await this.activityModel.findByPk(id);
		if (!activity) {
			throw new NotFoundException(`Activity with ID ${id} not found`);
		}
		return activity;
	}

	async remove(id: number): Promise<void> {
		const activity = await this.findOne(id);
		await activity.destroy();
	}

	async findByItinerary(itineraryId: number): Promise<Activity[]> {
		return this.activityModel.findAll({
			where: { itinerary_id: itineraryId } as WhereOptions<Activity>,
			order: [['time', 'ASC']],
		});
	}
}
