export interface OptimizedActivity {
	sequence: number;
	place: {
		fsq_place_id: string;
		name: string;
		location: { lat: number; lng: number };
		category: { id: string; name: string };
		rating: number | null;
		price_level: number;
		photos: string[];
		description: string;
		hours: {
			display: string;
			is_open: boolean;
		} | null;
	};
	timing: {
		arrival_time: string; // HH:MM
		departure_time: string; // HH:MM
		visit_duration_minutes: number;
		travel_time_from_previous: number;
		travel_distance_from_previous: number;
	};
	cost: {
		estimated: number;
		currency: string;
	};
	score: number;
	notes: string[];
}

export interface OptimizationSuccessResponse {
	success: true;
	request_id: string;
	itinerary_id: number;

	optimized_activities: OptimizedActivity[];

	summary: {
		activities_count: number;
		time_stats: {
			first_arrival: string;
			last_departure: string;
			total_duration_minutes: number;
			total_visit_time_minutes: number;
			total_travel_time_minutes: number;
			time_utilization: number;
		};
		budget_stats: {
			total_estimated_cost: number;
			budget_available: number;
			budget_remaining: number;
			budget_utilization: number;
			currency: string;
		};
		quality_stats: {
			average_score: number;
			average_rating: number;
			categories_distribution: Record<string, number>;
		};
	};

	optimization_info: {
		solution_status: string;
		objective_value: number;
		solve_time_seconds: number;
		candidates_provided: number;
		candidates_selected: number;
		selection_ratio: number;
		algorithm: string;
	};

	metadata: {
		generated_at: string;
		processor: string;
		optimization_model: string;
	};
}

export interface OptimizationErrorResponse {
	success: false;
	request_id: string;
	itinerary_id: number;

	error: {
		code: string;
		message: string;
		diagnosis: {
			primary_issue: string;
			details: string;
			constraints_violated: string[];
		};
		suggestions: Array<{
			action: string;
			description: string;
			example?: string;
			impact?: string;
			reason?: string;
		}>;
		alternative_options: {
			relaxed_solution_available: boolean;
			retry_recommended: boolean;
			fallback_mode: string;
		};
	};
	solver_stats: {
		solution_status: string;
		solve_time_seconds: number;
		candidates_evaluated: number;
		feasibility_checks_performed: number;
	} | null;
}

export type OptimizationResponse = OptimizationSuccessResponse | OptimizationErrorResponse;
