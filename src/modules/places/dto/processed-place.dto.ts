export interface ProcessedPlace {
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
	price_level: number; // 1-4
	photos: string[]; // URLs
	distance_from_origin: number; // metros
	score: number; // 0-100
	estimated_cost: number; // MXN
	estimated_duration: number; // minutos
	hours: {
		display: string;
		is_open: boolean;
		opening_time?: string;
		closing_time?: string;
	} | null;
	description: string;
}

