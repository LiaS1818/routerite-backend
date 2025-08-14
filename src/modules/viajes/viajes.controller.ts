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
import { ViajesService } from './viajes.service';
import { CreateViajeDto, UpdateViajeDto, ViajeFiltersDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ViajeFiltersInterface } from './viaje.interfaces';

@Controller('viajes')
@UseGuards(JwtAuthGuard)
export class ViajesController {
	constructor(private readonly viajesService: ViajesService) {}

	@Post()
	async create(@Body() createViajeDto: CreateViajeDto, @Request() req) {
		// Validar que las fechas sean coherentes
		const fechaInicio = new Date(createViajeDto.fecha_inicio);
		const fechaFin = new Date(createViajeDto.fecha_fin);
		
		if (fechaFin < fechaInicio) {
			throw new BadRequestException(
				'La fecha de fin debe ser mayor o igual a la fecha de inicio'
			);
		}

		// Verificar si hay conflictos de fechas
		const conflictingTrips = await this.viajesService.findByDateRange(
			req.user.id,
			fechaInicio,
			fechaFin
		);

		if (conflictingTrips.length > 0) {
			throw new BadRequestException(
				'Ya tienes viajes planificados que se superponen con estas fechas'
			);
		}

		const viajeData = {
			...createViajeDto,
			usuario_id: req.user.id,
			fecha_inicio: fechaInicio,
			fecha_fin: fechaFin,
		};

		return this.viajesService.create(viajeData);
	}

	@Get()
	async findAll(@Request() req, @Query() filters: ViajeFiltersDto) {
		if (Object.keys(filters).length > 0) {
			// Convertir fechas string a Date si existen
			const filtersInterface: ViajeFiltersInterface = {
				...filters,
				fechaInicio: filters.fechaInicio ? new Date(filters.fechaInicio) : undefined,
				fechaFin: filters.fechaFin ? new Date(filters.fechaFin) : undefined,
			};

			return this.viajesService.findByFilters(req.user.id, filtersInterface);
		}

		const viajes = await this.viajesService.findByUserId(req.user.id);
		return {
			data: viajes,
			total: viajes.length,
			page: 1,
			limit: viajes.length,
			totalPages: 1,
		};
	}

	@Get('upcoming')
	async findUpcoming(@Request() req) {
		return this.viajesService.findUpcomingByUser(req.user.id);
	}

	@Get('stats')
	async getStats(@Request() req) {
		return this.viajesService.getViajeStats(req.user.id);
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
		const viaje = await this.viajesService.findByIdAndUser(id, req.user.id);
		
		if (!viaje) {
			throw new HttpException(
				'Viaje no encontrado',
				HttpStatus.NOT_FOUND
			);
		}

		return viaje;
	}

	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateViajeDto: UpdateViajeDto,
		@Request() req
	) {
		// Validar fechas si se están actualizando
		if (updateViajeDto.fecha_inicio && updateViajeDto.fecha_fin) {
			const fechaInicio = new Date(updateViajeDto.fecha_inicio);
			const fechaFin = new Date(updateViajeDto.fecha_fin);
			
			if (fechaFin < fechaInicio) {
				throw new BadRequestException(
					'La fecha de fin debe ser mayor o igual a la fecha de inicio'
				);
			}

			// Asignar fechas validadas
			updateViajeDto.fecha_inicio = fechaInicio;
			updateViajeDto.fecha_fin = fechaFin;
		}

		return this.viajesService.updateByIdAndUser(id, req.user.id, updateViajeDto);
	}

	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
		const success = await this.viajesService.softDeleteByIdAndUser(id, req.user.id);
		
		if (!success) {
			throw new HttpException(
				'Error al eliminar el viaje',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}

		return { message: 'Viaje eliminado exitosamente' };
	}
}