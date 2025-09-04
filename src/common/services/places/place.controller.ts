import {
	Controller,
	Get,
	Query,
	Param,
	ParseIntPipe,
	ValidationPipe,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { Place } from './place.entity';
import { FiltrosLugarDto } from './dto/filters-place.dto';

@Controller('places')
export class PlaceController {
	constructor(private readonly placeService: PlaceService) {}

	@Get()
	async filtrarLugares(
		@Query(new ValidationPipe({ transform: true })) filtros: FiltrosLugarDto
	): Promise<Place[]> {
		return this.placeService.filtrarLugares(filtros);
	}

	@Get('todos')
	async obtenerTodosLugares(): Promise<Place[]> {
		return this.placeService.obtenerTodosLugares();
	}

	@Get(':id')
	async obtenerLugarPorId(@Param('id') id: string): Promise<Place | null> {
		return this.placeService.obtenerLugarPorId(id);
	}

	@Get('categorias/disponibles')
	async obtenerCategoriasDisponibles(): Promise<string[]> {
		const lugares = await this.placeService.obtenerTodosLugares();
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
