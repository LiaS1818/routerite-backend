import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FoursquareService } from './foursquare.service';

@Module({
  imports: [
    HttpModule, 
    ConfigModule, 
  ],
  providers: [FoursquareService],
  exports: [FoursquareService], // Exportar para usar en otros módulos
})
export class FoursquareModule {}