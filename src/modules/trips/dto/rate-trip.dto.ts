import { IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class RateTripDto {
	@IsNumber()
	@Min(1)
	@Max(5)
	@Transform(({ value }) => parseInt(value))
	rating: number;
}
