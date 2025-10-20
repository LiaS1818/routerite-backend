
export class ErrorDetailDto {
	code: string;
	type: string;
	details: string;
}

export class GenerationMetadataDto {

	candidates_evaluated: number;

	solve_time_seconds: number;

	algorithm: string;
}

export class FallbackOptionsDto {
	manual_selection: boolean;
	retry_with_relaxed_params: boolean;
}

export class ItineraryWithActivitiesDto {

	id: number;

	date: string;

	start_time: string;

	end_time: string;

	budget: number;

	activities: any[];

	summary: string;
}

export class GenerationResponseDto {

	success: boolean;

	message: string;

	request_id: string;

	itinerary?: ItineraryWithActivitiesDto;

	generation_info?: GenerationMetadataDto;

	error?: ErrorDetailDto;

	suggestions?: string[];

	fallback_options?: FallbackOptionsDto;
}
