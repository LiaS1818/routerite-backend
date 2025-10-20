export interface CandidatePlace {
	fsq_place_id: string;
	name: string;
	location: {
		lat: number;
		lng: number;
	};
	category: {
		id: string;
		name: string;
	};
	rating: number | null;
	price_level: number;
	distance_from_origin: number;
	score: number;
	estimated_cost: number;
	estimated_duration: number;
	photos: string[];
	hours: {
		display: string;
		is_open: boolean;
		opening_time?: string;
		closing_time?: string;
	} | null;
	description: string;
}

export interface OptimizationPayload {
	// Información del itinerario
	itinerary: {
		id: number;
		date: string; // YYYY-MM-DD
		origin: {
			lat: number;
			lng: number;
		};
		time_window: {
			start: string; // HH:MM
			end: string; // HH:MM
			total_minutes: number;
		};
		budget: {
			total: number;
			avg_per_activity: number;
			max_per_activity: number;
		};
		constraints: {
			activities: {
				min: number;
				max: number;
				target: number;
			};
			travel: {
				max_travel_time_between: number; // minutos
				total_travel_time_budget: number; // minutos
			};
		};
		preferences: {
			experience_type_ids: string[];
			prioritize_quality: boolean;
			balance_categories: boolean;
		};
	};

	// Lista de 50 lugares candidatos
	candidate_places: CandidatePlace[];

	// Metadata
	metadata: {
		request_id: string;
		destination: string;
		travelers_count: number;
		timestamp: string; // ISO 8601
	};
}
