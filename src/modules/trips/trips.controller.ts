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
import { CreateTripDto, UpdateTripExtendedDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Sequelize } from 'sequelize-typescript';
import { literal } from 'sequelize';
import { PostGISPoint } from '../../common/interfaces/PostGISPoint';
import { FoursquarePhotosService } from '../../common/services/foursquare/foursquare-place-photos.service';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
	constructor(
		private readonly tripsService: TripsService,
		private sequelize: Sequelize,
		private readonly fsqrPhotosService: FoursquarePhotosService
	) {}

	@Post()
	async create(@Body() createTripDto: CreateTripDto, @Request() req: any) {
		const transaction = await this.sequelize.transaction();

		// Validate that dates are coherent
		const startDate = new Date(createTripDto.start_date);
		const endDate = new Date(createTripDto.end_date);

		// separar latLng
		const [lat, lon] = createTripDto.location.latLng
			.split(',')
			.map(coord => parseFloat(coord.trim()));

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
		const { latLng } = createTripDto.location;
		const longitudeMatch = latLng.match(/lng:\s*([-+]?\d*\.\d+|\d+)/);
		const longitude = longitudeMatch ? longitudeMatch[1] : null;
		const latitudeMatch = latLng.match(/lat:\s*([-+]?\d*\.\d+|\d+),/);
		const latitude = latitudeMatch ? latitudeMatch[1] : null;

		const tripData = {
			...createTripDto, // Spread the properties of createTripDto, this will in
			location_point: literal(
				`ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)`
			) as unknown as PostGISPoint,
			destination: `${createTripDto.location.city}, ${createTripDto.location.state} - ${createTripDto.location.country}`,
			user_id: req.user.id,
			start_date: startDate,
			end_date: endDate,
		};

		try {
			const createdTrip = await this.tripsService.create(
				tripData,
				transaction
			);
			await transaction.commit();
			return createdTrip;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	@Get()
	async findAll(@Request() req) {
		return await this.tripsService.findByUserId(req.user.id, {
			attributes: { exclude: ['deleted_at', 'cover_image'] },
		});
	}

	@Get('upcoming')
	async findUpcoming(@Request() req) {
		return this.tripsService.findUpcomingByUser(req.user.id);
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
		const trip = await this.tripsService.findByIdAndUser(id, req.user.id);

		if (!trip) {
			throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);
		}

		return trip;
	}

	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateTripDto: UpdateTripExtendedDto,
		@Request() req
	) {
		// Delegar toda la lógica avanzada al nuevo servicio
		return this.tripsService.updateTripWithItineraryManagement(
			req.user.id,
			id,
			updateTripDto
		);
	}

	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
		const trip = await this.tripsService.findByIdAndUser(id, req.user.id);

		if (!trip) {
			throw new HttpException('Trip not found', HttpStatus.NOT_FOUND);
		}
		return this.tripsService.remove(id);
	}
}
