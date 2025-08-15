// filepath: /home/cardonapablo/Documentos/Proyectos/RouteRite/routerite-backend/src/modules/trips/trips.controller.ts
import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Request,
	Query,
	ParseIntPipe,
	HttpException,
	HttpStatus,
	BadRequestException,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto, UpdateTripDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TripFiltersInterface } from './trip.interfaces';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
	constructor(private readonly tripsService: TripsService) {}

	@Post()
	async create(@Body() createTripDto: CreateTripDto, @Request() req) {
		// Validate that dates are coherent
		const startDate = new Date(createTripDto.start_date);
		const endDate = new Date(createTripDto.end_date);

		if (endDate < startDate) {
			throw new BadRequestException(
				'The end date must be greater than or equal to the start date'
			);
		}

		// Check for date conflicts
		const conflictingTrips = await this.tripsService.findByDateRange(
			req.user.id,
			startDate,
			endDate
		);

		if (conflictingTrips.length > 0) {
			throw new BadRequestException(
				'You already have trips planned that overlap with these dates'
			);
		}

		const tripData = {
			...createTripDto,
			user_id: req.user.id,
			start_date: startDate,
			end_date: endDate,
		};

		return this.tripsService.create(tripData);
	}

	@Get()
	async findAll(@Request() req) {

		const trips = await this.tripsService.findByUserId(req.user.id);
		return {
			data: trips,
			total: trips.length,
			page: 1,
			limit: trips.length,
			totalPages: 1,
		};
	}

	@Get('upcoming')
	async findUpcoming(@Request() req) {
		return this.tripsService.findUpcomingByUser(req.user.id);
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
		const trip = await this.tripsService.findByIdAndUser(id, req.user.id);

		if (!trip) {
			throw new HttpException(
				'Trip not found',
				HttpStatus.NOT_FOUND
			);
		}

		return trip;
	}

	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateTripDto: UpdateTripDto,
		@Request() req
	) {
		const trip = await this.tripsService.findByIdAndUser(id, req.user.id);

		if (!trip) {
			throw new HttpException(
				'Trip not found',
				HttpStatus.NOT_FOUND
			);
		}

		// Validate dates if they're being updated
		if (updateTripDto.start_date || updateTripDto.end_date) {
			const startDate = updateTripDto.start_date
				? new Date(updateTripDto.start_date)
				: trip.start_date;

			const endDate = updateTripDto.end_date
				? new Date(updateTripDto.end_date)
				: trip.end_date;

			if (endDate < startDate) {
				throw new BadRequestException(
					'The end date must be greater than or equal to the start date'
				);
			}

			// Check for date conflicts with other trips
			const conflictingTrips = await this.tripsService.findByDateRange(
				req.user.id,
				startDate,
				endDate,
				id // Exclude current trip from check
			);

			if (conflictingTrips.length > 0) {
				throw new BadRequestException(
					'You already have trips planned that overlap with these dates'
				);
			}
		}

		return this.tripsService.update(id, updateTripDto);
	}

	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
		const trip = await this.tripsService.findByIdAndUser(id, req.user.id);

		if (!trip) {
			throw new HttpException(
				'Trip not found',
				HttpStatus.NOT_FOUND
			);
		}

		return this.tripsService.remove(id);
	}
}
