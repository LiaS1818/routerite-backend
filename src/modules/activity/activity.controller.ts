
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';

import { Activity } from 'src/database/models';
@Controller('activity')
export class ActivityController {

    constructor(private readonly activityService: ActivityService) {}

@Post()
  create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
    return this.activityService.create(createActivityDto);
  }
}
