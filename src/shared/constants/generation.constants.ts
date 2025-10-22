export const GenerationConstants = {
	// Tiempo mínimo y máximo por actividad (en minutos)
	MIN_ACTIVITY_DURATION: 45, // 60 visita + 30 viaje
	IDEAL_ACTIVITY_DURATION: 120, // 3 horas ideal

	// Límites de generación
	MIN_ACTIVITIES: 3,
	MAX_ACTIVITIES: 7,
	DEFAULT_ACTIVITIES: 5,
	MIN_SEARCH_RADIUS: 1000, // 1km en metros
	MAX_SEARCH_RADIUS: 50000, // 50km en metros
	DEFAULT_SEARCH_RADIUS: 10000, // 10km en metros
	MIN_TIME_WINDOW_MINUTES: 180, // 3 horas
	MIN_ITINERARY_DURATION: 180, // 3 horas

	// Parámetros de búsqueda
	MAX_SEARCH_RESULTS: 25,
	MIN_RATING_THRESHOLD: 6.5,

	// Restricciones de optimización
	MAX_TRAVEL_TIME_BETWEEN: 30, // minutos
	TOTAL_TRAVEL_TIME_BUDGET_RATIO: 0.25, // 25% del tiempo total
	TRAVEL_TIME_BUDGET_RATIO: 0.25, // 25% del tiempo total para viajes
	MAX_COST_PER_ACTIVITY_RATIO: 0.5, // 50% del presupuesto total
	MAX_BUDGET_PER_ACTIVITY_RATIO: 0.5, // Máximo 50% del presupuesto total en una actividad
	MIN_VISIT_DURATION: 45, // minutos
	MIN_PLACE_DISTANCE: 500, // metros para evitar clustering

	// Pesos para scoring
	SCORING_WEIGHTS: {
		RATING: 35,
		CATEGORY_RELEVANCE: 25,
		PROXIMITY: 20,
		POPULARITY: 10,
		PRICE_MATCH: 10
	},

	// Configuración de caché
	CACHE_SETTINGS: {
		PLACE_UPDATE_THRESHOLD_DAYS: 7
	},

	// Timeouts y reintentos
	SERVICE_CONFIG: {
		FLASK_TIMEOUT_MS: 90000,
		FLASK_MAX_RETRIES: 1,
		RETRY_DELAY_MS: 2000
	},

	// Campos de Foursquare a solicitar
	FOURSQUARE_FIELDS: [
		'fsq_place_id',
		'name',
		'geocodes',
		'categories',
		'rating',
		'price',
		'hours',
		'photos',
		'distance',
		'description'
	].join(','),

	// Códigos de error
	ERROR_CODES: {
		INSUFFICIENT_TIME: 'INSUFFICIENT_TIME',
		NO_FEASIBLE_SOLUTION: 'NO_FEASIBLE_SOLUTION',
		INSUFFICIENT_PLACES: 'INSUFFICIENT_PLACES',
		INVALID_PARAMETERS: 'INVALID_PARAMETERS',
		ITINERARY_NOT_CONFIGURED: 'ITINERARY_NOT_CONFIGURED',
		GENERATION_FAILED: 'GENERATION_FAILED'
	},

	// Tipos de error
	ERROR_TYPES: {
		VALIDATION_ERROR: 'VALIDATION_ERROR',
		OPTIMIZATION_ERROR: 'OPTIMIZATION_ERROR',
		RESOURCE_ERROR: 'RESOURCE_ERROR',
		SYSTEM_ERROR: 'SYSTEM_ERROR'
	},

	// Algoritmos de optimización disponibles
	ALGORITHMS: {
		GENETIC_ALGORITHM: 'GENETIC_ALGORITHM',
		GREEDY: 'GREEDY',
		SIMULATED_ANNEALING: 'SIMULATED_ANNEALING'
	}
};
