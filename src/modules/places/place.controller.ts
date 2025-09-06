import {
	Controller,
	Get,
	Query,
	Param,
	ParseIntPipe,
	ValidationPipe,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { FSQRPlace } from 'src/common/interfaces/FSQRPlace.interface';
import { FilterPlacesDto } from './dto/filters-place.dto';

@Controller('places')
export class PlaceController {
	constructor(private readonly placeService: PlaceService) {}

	@Get()
	async filterPlaces(
		@Query(new ValidationPipe({ transform: true })) filter: FilterPlacesDto
	): Promise<FSQRPlace[]> {
		return this.placeService.filterPlaces(filter);
	}

	@Get('all')
	async getAllPlaces(): Promise<FSQRPlace[]> {
		return this.placeService.getAllPlaces();
	}

	@Get(':id')
	async getPlaceById(@Param('id') id: string): Promise<FSQRPlace | null> {
		return this.placeService.getPlaceById(id);
	}

	@Get('categories/available')
	async getAvailableCategories(): Promise<string[]> {
		const places = await this.placeService.getAllPlaces();
		const categories = new Set<string>();

		places.forEach(place => {
			place.categories.forEach(cat => {
				categories.add(cat.name);
				categories.add(cat.plural_name);
			});
		});

		return Array.from(categories).sort();
	}
}
