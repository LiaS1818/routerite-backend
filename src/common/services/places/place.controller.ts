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
		@Query(new ValidationPipe({ transform: true })) filtros: FilterPlacesDto
	): Promise<FSQRPlace[]> {
		return this.placeService.filtrarLugares(filtros);
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
		const lugares = await this.placeService.getAllPlaces();
		const categorias = new Set<string>();

		lugares.forEach(lugar => {
			lugar.categories.forEach(cat => {
				categorias.add(cat.name);
				categorias.add(cat.plural_name);
			});
		});

		return Array.from(categorias).sort();
	}
}
