
import { Controller, 
    Get,
    Post,
    Body, 
    Patch, 
    Param, 
    Delete, 
    ParseIntPipe, 
    Query,
    BadRequestException
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
    
import { Activity } from 'src/database/models';
@Controller('activity')
export class ActivityController {

    constructor(private readonly activityService: ActivityService) {}

@Post()
  async create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
console.log('Intentando crear actividad con itinerary_id:', createActivityDto.itinerary_id);
  
  try {
    return await this.activityService.create(createActivityDto);
  } catch (error) {
    console.error('Error al crear actividad:', error);
    throw new BadRequestException('No se pudo crear la actividad');
  }
  }
}
