import { IsBoolean, IsDateString, IsOptional, ValidateIf } from 'class-validator';

export class UpdatePremiumDto {
	@IsBoolean()
	is_premium: boolean;

	@ValidateIf(o => o.is_premium === true)
	@IsDateString()
	premium_start_date: string;

}
