export interface ActivityToOptimize {
	id: number;
	name: string;
	description: string;
	location: {
		lat: number;
		lng: number;
	};
	category: {
		id: string;
		name: string;
	};
	estimated_duration: number; // minutos
	estimated_cost: number;
	rating: number | null;
	current_sequence?: number | null;
	place_data: any; // JSON del place original
}

export interface ActivityOptimizationPayload {
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
		};
	};

	// Lista de actividades existentes a optimizar
	activities: ActivityToOptimize[];

	// Opciones de optimización
	options: {
		preserve_order: boolean; // Si debe preservar el orden actual
		minimize_travel_time: boolean; // Si debe minimizar tiempo de viaje
		balance_timing: boolean; // Si debe balancear los tiempos de visita
	};

	// Metadata
	metadata: {
		request_id: string;
		timestamp: string; // ISO 8601
	};
}