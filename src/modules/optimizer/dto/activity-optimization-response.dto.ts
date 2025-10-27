export interface OptimizedActivityResult {
	id: number; // ID de la actividad original
	sequence: number;
	timing: {
		start_time: string; // HH:MM
		end_time: string; // HH:MM
		duration_minutes: number;
		travel_time_from_previous: number; // minutos
		travel_distance_from_previous: number; // metros
	};
}

export interface ActivityOptimizationSuccessResponse {
	success: true;
	request_id: string;
	itinerary_id: number;

	optimized_activities: OptimizedActivityResult[];

	summary: {
		activities_count: number;
		time_stats: {
			first_start: string; // HH:MM
			last_end: string; // HH:MM
			total_duration_minutes: number;
			total_visit_time_minutes: number;
			total_travel_time_minutes: number;
			time_utilization: number; // porcentaje
		};
		travel_stats: {
			total_distance_meters: number;
			average_travel_time_minutes: number;
			max_travel_time_minutes: number;
		};
	};

	optimization_info: {
		solution_status: string;
		objective_value: number;
		solve_time_seconds: number;
		algorithm: string;
		improvements: {
			travel_time_reduction: number; // porcentaje
			time_utilization_improvement: number; // porcentaje
		};
	};

	metadata: {
		generated_at: string;
		processor: string;
		optimization_model: string;
	};
}

export interface ActivityOptimizationErrorResponse {
	success: false;
	request_id: string;
	itinerary_id: number;

	error: {
		code: string;
		message: string;
		details: string;
		suggestions: string[];
	};
}

export type ActivityOptimizationResponse =
	| ActivityOptimizationSuccessResponse
	| ActivityOptimizationErrorResponse;
