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
	Logger,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto, UpdateTripExtendedDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Sequelize } from 'sequelize-typescript';
import { literal } from 'sequelize';
import { PostGISPoint } from '../../common/interfaces/PostGISPoint';
import { SupabaseStorageService } from '../supabase/supabase-storage.service';
import fsqDevelopersPlaces, {
	PlaceSearchMetadataParam,
	PlaceSearchResponse200,
} from '@api/fsq-developers-places';
import { ConfigService } from '@nestjs/config';
import { FSQRPlace } from '../../common/interfaces/FSQRPlace.interface';
import { FoursquareMockService } from '../../common/services/foursquare/foursquare-mock.service';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
	private readonly logger = new Logger(TripsController.name);

	constructor(
		private readonly tripsService: TripsService,
		private sequelize: Sequelize,
		private readonly supabaseStorageService: SupabaseStorageService,
		private readonly configService: ConfigService,
		private readonly fsqDevelopersPlaces: FoursquareMockService
	) {}

	@Post()
	async create(@Body() createTripDto: CreateTripDto, @Request() req: any) {
		const transaction = await this.sequelize.transaction();

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
		const { latLng } = createTripDto.location;
		const longitudeMatch = latLng.match(/lng:\s*([-+]?\d*\.\d+|\d+)/) || [
			null,
			'0.0',
		];
		const longitude = longitudeMatch[1];
		const latitudeMatch = latLng.match(/lat:\s*([-+]?\d*\.\d+|\d+),/) || [
			null,
			'0.0',
		];
		const latitude = latitudeMatch[1];

		const tripData = {
			...createTripDto, // Spread the properties of createTripDto, this will in
			location_point: literal(
				`ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)`
			) as unknown as PostGISPoint,
			lat: latitude,
			lng: longitude, // Fixed: was 'lon' but should be 'lng' to match model
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

			const params: PlaceSearchMetadataParam = {
				query: createdTrip.location.name,
				ll: `${createdTrip.lat},${createdTrip.lng}`,
				limit: 1,
				radius: 100,
				'X-Places-Api-Version': "2025-06-17",
				sort: "RELEVANCE",
				fields: "fsq_place_id,photos"
			}

			const fsqrApiKey = this.configService.get<string>('FSQR_API_KEY') || " ";
			const useFSQRMock = this.configService.get('USE_FSQR_MOCK', true);
			const fsqrService =  useFSQRMock != "false"  ? this.fsqDevelopersPlaces : fsqDevelopersPlaces;
			fsqrService.auth(fsqrApiKey);
			const placesResponse =  await fsqrService.placeSearch(params)
			const results = placesResponse.data.results || [];

			let photoUrl, fsqId: unknown;
			for(const result of results){
				// @ts-ignore
				const place: FSQRPlace = result as FSQRPlace;
				fsqId = place.fsq_place_id;
				if(place.photos && place.photos.length > 0)
					photoUrl = place.photos[0].prefix + "360x390" + place.photos[0].suffix;
			}
			this.logger.debug(`Found place: fsqId=${fsqId}, photoUrl=${photoUrl}`);

			// Si se encontró una imagen, subirla a Supabase Storage
			if (photoUrl && fsqId) {
				try {
					// Generar la ruta para la imagen en Supabase
					const storagePath = this.supabaseStorageService.generateTripCoverPath(
						createdTrip.id,
						photoUrl
					);

					this.logger.debug(`Uploading image to Supabase: ${storagePath}`);

					// Subir la imagen a Supabase Storage
					const supabaseImageUrl = await this.supabaseStorageService.uploadImageFromUrl(
						photoUrl,
						storagePath
					);

					// Actualizar el trip con la URL de Supabase
					 await this.tripsService.update(
						createdTrip.id,
						{ cover_image: supabaseImageUrl },
						transaction
					);
					createdTrip.cover_image = supabaseImageUrl;

					this.logger.log(`Trip cover image uploaded successfully: ${supabaseImageUrl}`);
				} catch (imageError) {
					// Si falla la subida de imagen, loguear el error pero no fallar el viaje
					this.logger.warn(`Failed to upload trip cover image: ${imageError.message}`);
					// Opcionalmente, podríamos guardar la URL original como fallback
					// await this.tripsService.update(createdTrip.id, { cover_image: photoUrl }, transaction);
				}
			} else {
				this.logger.warn(`No image found for place: ${createTripDto.location.name}`);
			}

			await transaction.commit();
			return createdTrip;
		} catch (error) {
			await transaction.rollback();
			this.logger.error(`Error creating trip: ${error.message}`, error.stack);
			throw error;
		}
	}

	@Get()
	async findAll(@Request() req) {
		return await this.tripsService.findByUserId(req.user.id);
	}

	@Get('upcoming')
	async findUpcoming(@Request() req) {
		return this.tripsService.findUpcomingByUser(req.user.id);
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
		const trip = await this.tripsService.findByIdWithAccess(
			id,
			req.user.id
		);

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
		// Only owners can update trips - use strict validation
		const trip = await this.tripsService.findByIdAndUser(id, req.user.id);

		if (!trip) {
			throw new HttpException(
				'Trip not found or you are not the owner',
				HttpStatus.NOT_FOUND
			);
		}

		// Delegar toda la lógica avanzada al nuevo servicio
		return this.tripsService.updateTripWithItineraryManagement(
			req.user.id,
			id,
			updateTripDto
		);
	}

	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
		// Only owners can delete trips - use strict validation
		const trip = await this.tripsService.findByIdAndUser(id, req.user.id);

		if (!trip) {
			throw new HttpException(
				'Trip not found or you are not the owner',
				HttpStatus.NOT_FOUND
			);
		}
		return this.tripsService.remove(id);
	}
}
