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
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity } from 'src/database/models';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

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

	// To get all activities of an itinerary by trip Id
	

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
		@Query('date') date: string,
		@Request() req,
	) {

		const activities = await this.activityService.findByTripDate(11, '2025-09-29', req.user.id);
		// imprimir respuesta
		console.log('Activities found:', activities);
		return activities;

	}

}
