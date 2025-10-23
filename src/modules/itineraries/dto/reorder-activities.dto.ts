import { IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ActivitySequenceDto {
  @IsInt()
  activity_id: number;

  @IsInt()
  @Min(1)
  sequence: number;
}

export class ReorderActivitiesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivitySequenceDto)
  activities: ActivitySequenceDto[];
}

