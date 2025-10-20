export interface PlaceSearchParams {
	lat: number;
	lng: number;
	radius: number;
	categories: string[];
	limit: number;
	date: Date;
	time_window: {
		start: string;
		end: string;
	};
}

