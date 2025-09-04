import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	ParseIntPipe,
	UseGuards,
	Request,
	Patch,
} from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';

@Controller('itineraries')
@UseGuards(JwtAuthGuard)
export class ItinerariesController {
	constructor(private readonly itinerariesService: ItinerariesService) {}

	@Post()
	async create(
		@Body() createItineraryDto: CreateItineraryDto,
		@Request() req
	) {
		return this.itinerariesService.createItinerary(
			createItineraryDto,
			req.user.id
		);
	}

	// Get all itineraries and activities of a trip
	@Get('/all')
	async findAll(
		@Query('tripId', ParseIntPipe) tripId: number,
		@Request() req
	) {
		return this.itinerariesService.getItinerariesByTripId(
			tripId,
			req.user.id
		);
	}

	// To get a specific itinerary by ID
	@Get(':id')
	async getItinerary(@Param('id', ParseIntPipe) id: number, @Request() req) {
		try {
			const itinerary =
				await this.itinerariesService.getItineraryWithActivities(
					id,
					req.user.id
				);
			return itinerary;
		} catch (error) {
			return { statusCode: 404, message: 'Itinerary not found' };
		}
	}

	@Get(':id/place')
	async getMockPlaceForTesting() {
		return {
			fsq_id: '4d37d5252a7b59413dacfc47',
			name: 'Hotel RIU Plaza Guadalajara',
			description: 'Hotel RIU Plaza Guadalajara',
			distance: 1000, // Distance in meters from the starting point
			price: 1, // 1= Cheap, 2 = Moderate, 3 = Expensive, 4 = Very Expensive
			rating: 9.2, // Out of 10
			social_media: {
				facebook_id: '169805070156',
				instagram: 'riuhotels',
				twitter: 'riuhoteles',
			},
			tel: '33 3880 7500',
			website:
				'https://www.riu.com/en/hotel/mexico/guadalajara/hotel-riu-plaza-guadalajara',
			categories: [
				{
					id: 13065,
					name: 'Restaurante',
					short_name: 'Restaurante',
					plural_name: 'Restaurantes',
				},
				{
					id: 19014,
					name: 'Hotel',
					short_name: 'Hotel',
					plural_name: 'Hoteles',
				},
			],
			geocodes: {
				drop_off: { latitude: 20.665763, longitude: -103.393286 },
				main: { latitude: 20.665983, longitude: -103.393613 },
			},
			hours: {
				display: 'Open Daily 0:00-24:00',
				is_local_holiday: false,
				open_now: true,
				regular: [
					{
						open: '08:00',
						closed: '20:00',
						day: 1,
					},
				],
			},
			location: {
				address: 'Avenida López Mateos 830',
				country: 'MX',
				cross_street: 'Av. Lázaro Cárdenas',
				formatted_address:
					'Avenida López Mateos 830 (Av. Lázaro Cárdenas), 44500 Guadalajara, Jalisco',
				locality: 'Guadalajara',
				postcode: '44500',
				region: 'Jalisco',
			},
			photos: [
				{
					id: '689c7ea74390903421290daa',
					created_at: '2025-08-13T12:01:43.000Z',
					prefix: 'https://fastly.4sqi.net/img/general/',
					suffix: '/17037899_BdtjNJmqgK2auWTxfNj3s-R9M0ovHsYkELcyIK-VA0s.jpg',
					width: 1440,
					height: 1440,
				},
				{
					id: '68446a9a5ea9846cc8fcbb9a',
					created_at: '2025-06-07T16:36:42.000Z',
					prefix: 'https://fastly.4sqi.net/img/general/',
					suffix: '/25002554_U1q7d6PfvhEswKIzBvmlebcijb4U1lS5wh0146Oh68c.jpg',
					width: 1440,
					height: 1920,
				},
				{
					id: '6823dc781d46b64de01d6ef3',
					created_at: '2025-05-13T23:57:44.000Z',
					prefix: 'https://fastly.4sqi.net/img/general/',
					suffix: '/11197279_wsyG_eVS3MpH27-frhDjrEd2I1rcnh5UE5vdwxeEB3Q.jpg',
					width: 1920,
					height: 1080,
				},
				{
					id: '66e0b207e0620118524df5b6',
					created_at: '2024-09-10T20:54:31.000Z',
					prefix: 'https://fastly.4sqi.net/img/general/',
					suffix: '/76981124_AJmlnWiBg5L5FwfsK2QPTqkfv6GJucb7wN48UlOr8-I.jpg',
					width: 1080,
					height: 1920,
				},
				{
					id: '66b39d004281ed4a6a50fbba',
					created_at: '2024-08-07T16:12:48.000Z',
					prefix: 'https://fastly.4sqi.net/img/general/',
					suffix: '/13432088_mSWwOeE0v689CVFVkvJXx7y5hLGe_XNzOeqMLL3vd0A.jpg',
					width: 1920,
					height: 1388,
				},
			],
		};
	}

	//update itinerary. receiving itinerary id in body json
	@Patch(':id')
	async updateItinerary(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateItineraryDto: UpdateItineraryDto
	) {
		return this.itinerariesService.updateItinerary(id, updateItineraryDto);
	}

	//delete itinerary
	@Delete(':id')
	async deleteItinerary(@Param('id', ParseIntPipe) id: number) {
		return this.itinerariesService.remove(id);
	}
}
