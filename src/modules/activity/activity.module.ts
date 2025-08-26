import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { Activity } from '../../database/models/activity.model';

@Module({
	imports: [SequelizeModule.forFeature([Activity])],
	providers: [ActivityService],
	controllers: [ActivityController],
	exports: [ActivityService],
})
export class ActivityModule {}
