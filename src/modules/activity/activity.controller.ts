import {
	Controller,
	Get,
	Post,
	Body,
	ParseIntPipe,
	Query,
	BadRequestException,
	UseGuards,
	Request,
	Param,
	Delete,
	Patch,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity } from 'src/database/models';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ReplacePlaceDto } from './dto/replace-place.dto';
import { FSQRPlace } from '../../common/interfaces/FSQRPlace.interface';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
	constructor(
		private readonly activityService: ActivityService,
		private configService: ConfigService
	) {}

	@Post()
	async create(
		@Body() createActivityDto: CreateActivityDto,
		@Request() req
	): Promise<Activity> {
		console.log(
			'Intentando crear actividad con itinerary_id:',
			createActivityDto.itinerary_id
		);

		try {
			return await this.activityService.create(
				createActivityDto,
				req.user.id
			);
		} catch (error) {
			console.error('Error al crear actividad:', error);
			throw new BadRequestException('No se pudo crear la actividad');
		}
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
		return this.activityService.findOne(id, req.user.id);
	}

	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
		await this.activityService.remove(id, req.user.id);
		return { message: 'Activity deleted successfully' };
	}

	@Get()
	async itineraryActivities(
		@Query('trip_id', ParseIntPipe) tripId: number,
		@Query('current_date') date: string,
		@Request() req,
	) {
		const activities = await this.activityService.findByTripDate(tripId, date, req.user.id);
		// imprimir respuesta
		console.log('Activities found:', activities.length);
		return activities;

	}

	@Patch(':id')
	async update(
	@Param('id', ParseIntPipe) id: number,
	@Body() dto: UpdateActivityDto,
	@Request() req,
	) {
		const userId = req.user?.id; 
		return this.activityService.update(id, dto, userId);
	}

	@Delete(':id')
	async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
		await this.activityService.remove(id, req.user.id);
		return { message: 'Activity deleted successfully' };
	}

	@Get(':id/replacement-candidates')
	async getReplacementCandidates(
		@Param('id', ParseIntPipe) id: number,
		@Request() req,
	): Promise<FSQRPlace[]> {
		return this.activityService.getReplacementCandidates(id, req.user.id);
	}

	@Patch(':id/replace-place')
	async replacePlace(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: ReplacePlaceDto,
		@Request() req,
	): Promise<Activity> {
		return this.activityService.replacePlace(id, dto.place, req.user.id);
	}

}
