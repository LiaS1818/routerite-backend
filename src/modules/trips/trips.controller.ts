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
	ParseIntPipe,
	HttpException,
	HttpStatus,
	BadRequestException,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto, UpdateTripDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TripFiltersInterface } from './trip.interfaces';
import { FoursquareService } from 'src/foursquare/foursquare.service';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
	constructor(
		private readonly tripsService: TripsService,
		private readonly foursquareService: FoursquareService
	) { }

	@Post()
	async create(@Body() createTripDto: CreateTripDto, @Request() req) {
		console.log("User", req.user)
		// Validate that dates are coherent
		const startDate = new Date(createTripDto.start_date);
		const endDate = new Date(createTripDto.end_date);

		// separar latLng
		const [lat, lon] = createTripDto.location.latLng.split(',').map(coord => parseFloat(coord.trim()));

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

		// obtener foto sugerida
		const photoUrl = await this.foursquareService.getTripPhoto(lat, lon);

		const tripData = {
			...createTripDto, // Spread the properties of createTripDto, this will in
			destination: `${createTripDto.location.city}, ${createTripDto.location.state} - ${createTripDto.location.country}`,
			user_id: req.user.id,
			cover_image: photoUrl ?? undefined,
			start_date: startDate,
			end_date: endDate,
		};

		return this.tripsService.create(tripData);
	}

	@Get()
	async findAll(@Request() req) {
		const trips = await this.tripsService.findByUserId(req.user.id, {
			attributes: { exclude: ['deleted_at', 'cover_image'] },
		});
		return trips;
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
