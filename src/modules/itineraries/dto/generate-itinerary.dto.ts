import {
	IsOptional,
	IsInt,
	IsNumber,
	IsBoolean,
	Min,
	Max
} from 'class-validator';

export class GenerateItineraryDto {

	@IsOptional()
	@IsInt()
	@Min(3)
	@Max(10)
	min_activities?: number = 5;

	@IsOptional()
	@IsInt()
	@Min(3)
	@Max(10)
	max_activities?: number = 5;


	@IsOptional()
	@IsInt()
	@Min(1000)
	@Max(50000)
	search_radius?: number = 10000;

	@IsOptional()
	@IsNumber()
	@Min(3)
	@Max(15)
	min_rating?: number = 6.5;

	@IsOptional()
	@IsBoolean()
	prioritize_quality?: boolean = true;

	@IsOptional()
	@IsBoolean()
	balance_categories?: boolean = true;
}
