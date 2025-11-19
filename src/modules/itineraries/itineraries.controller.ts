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
	Logger,
	NotFoundException,
	BadRequestException,
	UnprocessableEntityException,
	ServiceUnavailableException,
	Inject,
} from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { FoursquareMockService } from '../../common/services/foursquare/foursquare-mock.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
import { GenerationResponseDto } from './dto/generation-response.dto';
import { ItineraryGeneratorService } from './services/itinerary-generator.service';
import { ItineraryValidatorService } from './services/itinerary-validator.service';
import { ReorderActivitiesDto } from './dto/reorder-activities.dto';
import { ActivityService } from '../activity/activity.service';
import { CategoriesService } from '../categories/categories.service';
import { FoursquareCategory } from '../../database/models/foursquare-categories.model';

@Controller('itineraries')
@UseGuards(JwtAuthGuard)
export class ItinerariesController {
	private readonly logger = new Logger(ItinerariesController.name);

	constructor(
		private readonly itinerariesService: ItinerariesService,
		private fsqDevelopersPlaces: FoursquareMockService,
		private readonly itineraryGeneratorService: ItineraryGeneratorService,
		private readonly itineraryValidatorService: ItineraryValidatorService,
		private readonly activityService: ActivityService,
		private readonly foursquareCategoryService: CategoriesService
	) {}

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

	@Get(':id')
	async findOne(
		@Param('id', ParseIntPipe) id: number,
		@Request() req
	) {
		const itinerary = await this.itinerariesService.findOne(id);
		let response: any = {
			...itinerary.toJSON()
		}
		if(itinerary.experience_type_ids == "")
			delete response.experience_type_ids

		if(itinerary.experience_type_ids != null && itinerary.experience_type_ids != "") {
			const ids = itinerary.experience_type_ids.split(',');
			const labels: string[] = []
			const categories: FoursquareCategory[] = []
			// Find the label in the FSQRCategories table
			for(let i = 0; i < ids.length; i++) {
				const cat = await this.foursquareCategoryService.findById(ids[i]);
				if (cat instanceof FoursquareCategory) {
					categories.push(cat);
					labels.push(cat.name);
				} else {
					// Remove from list
					ids.splice(i, 1);
					i--;
				}
			}
			response = {
				...response,
				experience_type_ids: ids,
				experience_type_labels: labels,
				experience_types: categories
			}
		}
		return response;
	}

	@Get(':id/place')
	async getMockPlaceForTesting() {
		this.fsqDevelopersPlaces.auth("token")
		return this.fsqDevelopersPlaces.getRandomPlace()
	}

	@Get(':itineraryId/activities')
	async getActivitiesByItinerary(
		@Param('itineraryId', ParseIntPipe) itineraryId: number,
		@Request() req
	) {
		const activities = await this.activityService.findAllByItinerary(itineraryId);
		return {
			activities
		}
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

	//delete itinerary
	@Delete(':id')
	async deleteItinerary(@Param('id', ParseIntPipe) id: number) {
		return this.itinerariesService.remove(id);
	}

	@Post(':id/generate')
	async generateItinerary(
		@Param('id', ParseIntPipe) itineraryId: number,
		@Body() generateDto: GenerateItineraryDto = new GenerateItineraryDto(),
		@Request() req,
	): Promise<GenerationResponseDto> {
		const userId = req.user.id;
		let requestId: string = '';
		try {
			// Validar que el itinerario existe y pertenece al usuario
			await this.itineraryValidatorService.validateItineraryExists(itineraryId, userId);

			// Validar factibilidad de generación
			 await this.itineraryValidatorService.validateGenerationFeasibility(itineraryId);

			this.logger.log(`Starting itinerary generation - User: ${userId}, Itinerary: ${itineraryId}`);
			// Generar el itinerario
			const result = await this.itineraryGeneratorService.generateItinerary(
				itineraryId,
				userId,
				generateDto
			);

			requestId = result.request_id;
			this.logger.log(`[${requestId}] Itinerary generation completed successfully`);
			return result;

		} catch (error) {
			this.logger.error(`[${requestId}] Error generating itinerary: ${error.message}`, error.stack);

			// Mapear errores específicos a respuestas HTTP apropiadas
			if (error instanceof NotFoundException) {
				throw new NotFoundException({
					success: false,
					message: 'Itinerario no encontrado o no tienes permisos para acceder a él',
					error: {
						code: 'ITINERARY_NOT_FOUND',
						type: 'RESOURCE_ERROR',
						details: error.message,
					},
				});
			}

			if (error instanceof BadRequestException) {
				throw new BadRequestException({
					success: false,
					message: 'Parámetros de entrada inválidos',
					error: {
						code: 'INVALID_PARAMETERS',
						type: 'VALIDATION_ERROR',
						details: error.message,
					},
				});
			}

			if (error instanceof UnprocessableEntityException) {
				throw new UnprocessableEntityException({
					success: false,
					message: 'No se pudo generar el itinerario con los parámetros dados',
					error: {
						code: 'NO_FEASIBLE_SOLUTION',
						type: 'OPTIMIZATION_ERROR',
						details: error.message,
					},
					suggestions: [
						'Intenta aumentar el presupuesto disponible',
						'Considera ampliar el radio de búsqueda',
						'Reduce el número máximo de actividades',
						'Ajusta los criterios de rating mínimo',
					],
					fallback_options: {
						manual_selection: true,
						retry_with_relaxed_params: true,
					},
				});
			}

			if (error instanceof ServiceUnavailableException) {
				throw error; // Ya viene con el formato correcto
			}

			// Error genérico
			throw new ServiceUnavailableException({
				success: false,
				message: 'Error interno del servidor durante la generación',
				error: {
					code: 'INTERNAL_ERROR',
					type: 'SYSTEM_ERROR',
					details: 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.',
				},
				suggestions: [
					'Intenta nuevamente en unos momentos',
					'Si el problema persiste, contacta al soporte técnico',
				],
				fallback_options: {
					manual_selection: true,
					retry_with_relaxed_params: false,
				},
			});
		}
	}

	@Patch(':id')
	async updateItinerary(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateItineraryDto: UpdateItineraryDto,
		@Request() req
	) {
		return this.itinerariesService.updateItinerary(
			id,
			updateItineraryDto,
		);
	}

	@Patch(':itineraryId/activities/reorder')
	async reorderActivities(
		@Param('itineraryId', ParseIntPipe) itineraryId: number,
		@Body() reorderActivitiesDto: ReorderActivitiesDto,
		@Request() req
	) {
		const userId = req.user.id;
		return this.itinerariesService.reorderActivities(itineraryId, reorderActivitiesDto, userId);
	}

	@Get(':id/activities/optimize')
	async optimizeActivities(
		@Param('id', ParseIntPipe) itineraryId: number,
		@Request() req
	) {
		const userId = req.user.id;

		try {
			this.logger.log(`Starting activity optimization for itinerary ${itineraryId} by user ${userId}`);

			const result = await this.itinerariesService.optimizeActivities(itineraryId, userId);

			this.logger.log(`Activity optimization completed for itinerary ${itineraryId}`);
			return result;

		} catch (error) {
			this.logger.error(`Error optimizing activities for itinerary ${itineraryId}: ${error.message}`, error.stack);

			if (error instanceof NotFoundException) {
				throw new NotFoundException({
					success: false,
					message: 'Itinerario no encontrado o no tienes permisos para acceder a él',
					error: {
						code: 'ITINERARY_NOT_FOUND',
						type: 'RESOURCE_ERROR',
						details: error.message,
					},
				});
			}

			if (error instanceof BadRequestException) {
				throw new BadRequestException({
					success: false,
					message: 'Solicitud inválida',
					error: {
						code: 'INVALID_REQUEST',
						type: 'VALIDATION_ERROR',
						details: error.message,
					},
				});
			}

			if (error instanceof ServiceUnavailableException) {
				throw error;
			}

			throw new ServiceUnavailableException({
				success: false,
				message: 'Error al optimizar las actividades',
				error: {
					code: 'OPTIMIZATION_ERROR',
					type: 'SERVICE_ERROR',
					details: error.message || 'Error desconocido durante la optimización',
				},
			});
		}
	}


}
