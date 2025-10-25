import {
	IsArray,
	ValidateNested,
	IsInt,
	Min,
	IsNotEmpty,
	IsMilitaryTime,
} from 'class-validator';
import { Type } from 'class-transformer';

class ActivitySequenceDto {
	@IsInt()
	id: number;

	@IsInt()
 	@Min(0)
	sequence: number;

	@IsNotEmpty({ message: 'Time is required' })
	start_time: string;

	@IsNotEmpty({ message: 'Time is required' })
	end_time: string;
}

export class ReorderActivitiesDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ActivitySequenceDto)
	activities: ActivitySequenceDto[];

	@IsArray()
	@IsInt({ each: true })
	deletedActivities: number[];
}

