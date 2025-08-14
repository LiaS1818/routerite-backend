import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ViajesController } from './viajes.controller';
import { ViajesService } from './viajes.service';
import { Viaje } from '../../database/models/viaje.model';
import { User } from '../../database/models/user.model';

@Module({
	imports: [SequelizeModule.forFeature([Viaje, User])],
	controllers: [ViajesController],
	providers: [ViajesService],
	exports: [ViajesService],
})
export class ViajesModule {}