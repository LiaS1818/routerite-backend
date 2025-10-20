import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { of, throwError } from 'rxjs';
import { OptimizationPayload } from './dto/optimization-payload.dto';
import { OptimizationResponse, OptimizedActivity } from './dto/optimization-response.dto';

@Injectable()
export class OptimizerClientService {
	private readonly logger = new Logger(OptimizerClientService.name);
	private readonly flaskUrl: string;
	private readonly apiKey: string;
	private readonly optimizerTimeout: number;
	private readonly maxRetries: number;

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
	) {
		// Configuración desde environment
		this.flaskUrl = this.configService.get<string>('FLASK_SERVICE_URL') || 'http://localhost:5000';
		this.apiKey = this.configService.get<string>('FLASK_API_KEY') || 'default-api-key';
		this.optimizerTimeout = this.configService.get<number>('OPTIMIZER_TIMEOUT') || 90000;
		this.maxRetries = this.configService.get<number>('OPTIMIZER_MAX_RETRIES') || 1;

		this.logger.log(`Optimizer Client initialized: ${this.flaskUrl}, timeout: ${this.optimizerTimeout}ms, retries: ${this.maxRetries}`);
	}

	/**
	 * Generar UUID v4 simple sin dependencias externas
	 */
	private generateUuid(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	/**
	 * Cliente HTTP para comunicación con microservicio Flask
	 */
	async optimizeItinerary(payload: OptimizationPayload): Promise<OptimizationResponse> {
		const startTime = Date.now();
		let attemptCount = 0;
		let lastError: any;

		// PASO 1: Preparación del Request
		const { requestId, headers, validatedPayload, fullUrl } = this.prepareRequest(payload);

		this.logger.debug(`[${requestId}] Starting optimization request`, {
			itinerary_id: payload.itinerary.id,
			candidates: payload.candidate_places.length,
			url: fullUrl
		});

		// Loop de retry
		while (attemptCount <= this.maxRetries) {
			try {
				attemptCount++;

				this.logger.debug(`[${requestId}] Attempt ${attemptCount}/${this.maxRetries + 1}`);

				// PASO 2: Ejecución del Request
				const response = await this.executeRequest(fullUrl, validatedPayload, headers, requestId);

				// PASO 3: Manejo de Respuesta
				const result = await this.handleResponse(response, requestId, startTime);

				// PASO 5: Retorno exitoso
				this.logger.log(`[${requestId}] Optimization completed successfully in ${(Date.now() - startTime) / 1000}s`);
				return result;

			} catch (error) {
				lastError = error;

				// PASO 4: Manejo de Errores y Reintentos
				if (this.shouldRetry(error, attemptCount)) {
					const delayMs = this.calculateRetryDelay(attemptCount);
					this.logger.warn(`[${requestId}] Attempt ${attemptCount} failed, retrying in ${delayMs}ms: ${error.message}`);
					await this.delay(delayMs);
					continue;
				} else {
					// No más reintentos o error no recuperable
					break;
				}
			}
		}

		// Si llegamos aquí, todos los intentos fallaron
		this.logger.error(`[${requestId}] All optimization attempts failed after ${attemptCount} tries`);
		throw this.handleFinalError(lastError, requestId, payload);
	}

	/**
	 * PASO 1: Preparación del Request
	 */
	private prepareRequest(payload: OptimizationPayload) {
		// Generar request ID
		const requestId = this.generateUuid();

		// Incluir request ID en payload metadata
		const validatedPayload = {
			...payload,
			metadata: {
				...payload.metadata,
				request_id: requestId
			}
		};

		// Preparar headers
		const headers = {
			'Content-Type': 'application/json',
			'X-API-Key': this.apiKey,
			'X-Request-ID': requestId,
			'User-Agent': 'RouteRite-NestJS/1.0'
		};

		// Construir URL completa
		const fullUrl = `${this.flaskUrl}/api/v1/optimization/optimize-itinerary`;

		// Validar payload
		this.validatePayload(validatedPayload, requestId);

		// Loggear tamaño del payload para monitoring
		const payloadSize = JSON.stringify(validatedPayload).length;
		this.logger.debug(`[${requestId}] Payload prepared: ${payloadSize} bytes, ${payload.candidate_places.length} candidates`);

		return { requestId, headers, validatedPayload, fullUrl };
	}

	/**
	 * Validar estructura del payload
	 */
	private validatePayload(payload: OptimizationPayload, requestId: string): void {
		if (!payload.itinerary) {
			throw new Error('Payload missing itinerary data');
		}

		if (!payload.candidate_places || payload.candidate_places.length < 5) {
			throw new Error(`Insufficient candidate places: ${payload.candidate_places?.length || 0}, minimum 5 required`);
		}

		if (!payload.metadata) {
			throw new Error('Payload missing metadata');
		}

		this.logger.debug(`[${requestId}] Payload validation passed`);
	}

	/**
	 * PASO 2: Ejecución del Request
	 */
	private async executeRequest(
		url: string,
		payload: OptimizationPayload,
		headers: any,
		requestId: string
	): Promise<AxiosResponse<any>> {
		this.logger.debug(`[${requestId}] Executing POST request to ${url}`);

		const requestStart = Date.now();

		const response$ = this.httpService.post(url, payload, {
			headers,
			timeout: this.optimizerTimeout
		}).pipe(
			timeout(this.optimizerTimeout),
			catchError((error) => {
				const duration = Date.now() - requestStart;
				this.logger.error(`[${requestId}] HTTP request failed after ${duration}ms: ${error.message}`);
				return throwError(() => error);
			})
		);

		const response = await firstValueFrom(response$);

		const duration = Date.now() - requestStart;
		this.logger.debug(`[${requestId}] HTTP request completed in ${duration}ms, status: ${response.status}`);

		return response;
	}

	/**
	 * PASO 3: Manejo de Respuesta
	 */
	private async handleResponse(
		response: AxiosResponse<any>,
		requestId: string,
		startTime: number
	): Promise<OptimizationResponse> {
		const statusCode = response.status;
		const responseData = response.data;

		this.logger.debug(`[${requestId}] Processing response with status ${statusCode}`);

		switch (statusCode) {
			case 200:
				return this.handleSuccessResponse(responseData, requestId, startTime);

			case 422:
				return this.handleUnprocessableResponse(responseData, requestId);

			case 408:
				throw new Error('Request timeout from Flask service');

			case 503:
				throw new ServiceUnavailableException('Flask service temporarily unavailable');

			case 400:
				throw new Error(`Bad request: ${responseData?.message || 'Invalid payload structure'}`);

			case 500:
				throw new Error(`Flask internal server error: ${responseData?.message || 'Unknown error'}`);

			default:
				throw new Error(`Unexpected status code ${statusCode}: ${responseData?.message || 'Unknown response'}`);
		}
	}

	/**
	 * Manejar respuesta exitosa (200)
	 */
	private handleSuccessResponse(data: any, requestId: string, startTime: number): OptimizationResponse {
		// Validar estructura de respuesta
		if (!data || typeof data.success !== 'boolean') {
			throw new Error('Invalid response structure: missing success field');
		}

		if (!data.optimized_activities || !Array.isArray(data.optimized_activities)) {
			throw new Error('Invalid response structure: missing or invalid optimized_activities');
		}

		if (data.optimized_activities.length === 0) {
			throw new Error('Empty optimized_activities array');
		}

		// Mapear a OptimizationResponse DTO
		const result: OptimizationResponse = {
			success: true,
			optimized_activities: data.optimized_activities,
			request_id: requestId,
			itinerary_id: data.itinerary_id || null,
			summary: {
				activities_count: 5,
				time_stats: {
					first_arrival: '08:00',
					last_departure: '19:00',
					total_duration_minutes: 500,
					total_visit_time_minutes: 500,
					total_travel_time_minutes: 500,
					time_utilization: 1000
				},
				budget_stats: {
					total_estimated_cost: 1,
					budget_available: 1,
					budget_remaining: 1,
					budget_utilization: 1,
					currency: 'MXN'
				},
				quality_stats: {
					average_score: 10,
					average_rating: 4,
					categories_distribution: {
						'category_1': 10
					}
				},
			},
			optimization_info: {
				solution_status: 'solved',
				objective_value: 0,
				solve_time_seconds: 0,
				candidates_provided: 50,
				candidates_selected: 5,
				selection_ratio: 0.1,
				algorithm: 'ILP'
			},
			metadata: {
				generated_at: new Date().toString(),
				processor: 'a',
				optimization_model: 'a model'
			}
		};

		// Loggear éxito con estadísticas
		this.logger.log(`[${requestId}] Optimization SUCCESS: ${result.optimized_activities.length} activities, ` +
			`algorithm: ${result.optimization_info.algorithm}, solve_time: ${result.optimization_info.solve_time_seconds}s`);

		return result;
	}

	/**
	 * Manejar respuesta no procesable (422)
	 */
	private handleUnprocessableResponse(data: any, requestId: string): OptimizationResponse {
		// Validar que tiene estructura de error
		const hasErrorStructure = data.error?.code && data.error?.message;

		if (!hasErrorStructure) {
			this.logger.warn(`[${requestId}] 422 response missing proper error structure`);
		}

		// Mapear a OptimizationResponse con success: false
		const result: OptimizationResponse = {
			request_id: requestId,
			success: false,
			itinerary_id: data.itinerary_id || null,
			solver_stats: null,
			error: data.error || {
				code: 'NO_FEASIBLE_SOLUTION',
				type: 'OPTIMIZATION_ERROR',
				details: 'Unable to find a feasible itinerary solution',
				diagnosis: data.diagnosis || 'No additional diagnosis available',
				suggestions: data.suggestions || [
					'Try relaxing some constraints',
					'Increase budget or time window',
					'Consider different experience types'
				]
			},
		};

		// this.logger.warn(`[${requestId}] Optimization NOT FEASIBLE: ${result.error.code} - ${result.error.details}`);

		// NO lanzar excepción, es resultado válido
		return result;
	}

	/**
	 * PASO 4: Determinar si se debe reintentar
	 */
	private shouldRetry(error: any, attemptCount: number): boolean {
		// No más reintentos si ya alcanzamos el máximo
		if (attemptCount > this.maxRetries) {
			return false;
		}

		// Solo retry para errores 408 (Timeout) o errores de red
		const isTimeoutError = error.message?.includes('timeout') || error.code === 'ECONNABORTED';
		const isNetworkError = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(error.code);

		return isTimeoutError || isNetworkError;
	}

	/**
	 * Calcular delay exponencial para retry
	 */
	private calculateRetryDelay(attemptNumber: number): number {
		// Primer retry: 2 segundos, segundo retry: 4 segundos
		return Math.min(2000 * Math.pow(2, attemptNumber - 1), 8000);
	}

	/**
	 * Delay helper
	 */
	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Manejar error final después de todos los reintentos
	 */
	private handleFinalError(error: any, requestId: string, payload: OptimizationPayload): Error {
		// Logging de error final
		this.logger.error(`[${requestId}] Final optimization error`, {
			itinerary_id: payload.itinerary.id,
			error_type: error.constructor.name,
			error_message: error.message,
			error_code: error.code,
			stack_trace: error.stack?.split('\n').slice(0, 3).join('\n') // Truncar stack trace
		});

		// Mapear errores específicos
		if (error.code === 'ECONNREFUSED') {
			return new ServiceUnavailableException({
				success: false,
				message: 'Servicio de optimización no disponible',
				error: {
					code: 'OPTIMIZER_UNAVAILABLE',
					type: 'CONNECTION_ERROR',
					details: 'No se pudo conectar con el servicio de optimización Flask'
				},
				suggestions: [
					'Verifica que el servicio Flask esté ejecutándose',
					'Intenta nuevamente en unos momentos'
				]
			});
		}

		if (error.message?.includes('timeout')) {
			return new ServiceUnavailableException({
				success: false,
				message: 'Tiempo de espera agotado para la optimización',
				error: {
					code: 'OPTIMIZATION_TIMEOUT',
					type: 'TIMEOUT_ERROR',
					details: `La optimización no se completó en ${this.optimizerTimeout / 1000} segundos`
				},
				suggestions: [
					'Reduce el número de actividades máximo',
					'Simplifica los criterios de búsqueda',
					'Intenta con un radio de búsqueda menor'
				]
			});
		}

		// Error genérico
		return new ServiceUnavailableException({
			success: false,
			message: 'Error en el servicio de optimización',
			error: {
				code: 'OPTIMIZATION_SERVICE_ERROR',
				type: 'SERVICE_ERROR',
				details: error.message || 'Error desconocido en el servicio de optimización'
			},
			suggestions: [
				'Intenta nuevamente en unos momentos',
				'Si el problema persiste, contacta al soporte técnico'
			]
		});
	}

	/**
	 * Verificar salud del servicio Flask
	 */
	async healthCheck(): Promise<boolean> {
		try {
			const healthUrl = `${this.flaskUrl}/health`;
			const response$ = this.httpService.get(healthUrl, {
				timeout: 5000,
				headers: { 'X-API-Key': this.apiKey }
			}).pipe(
				timeout(5000),
				catchError(() => of(null))
			);

			const response = await firstValueFrom(response$);
			return response?.status === 200;
		} catch (error) {
			this.logger.warn(`Flask health check failed: ${error.message}`);
			return false;
		}
	}

	/**
	 * Obtener configuración del cliente
	 */
	getClientConfig(): any {
		return {
			flask_url: this.flaskUrl,
			timeout: this.optimizerTimeout,
			max_retries: this.maxRetries,
			has_api_key: !!this.apiKey
		};
	}
}
