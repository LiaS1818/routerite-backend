import { Injectable,
        Logger,
        NotFoundException
 } from '@nestjs/common';
import { Itinerary, Trip, User } from 'src/database/models';
import { InjectModel } from '@nestjs/sequelize';
import { Model } from 'sequelize';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ItinerariesService {


    private readonly logger = new Logger(ItinerariesService.name);

    constructor(
        @InjectModel(Trip)
        private readonly tripModel: typeof Trip,
        @InjectModel(User)
        private readonly userModel: typeof User,
        @InjectModel(Itinerary)
        private readonly itineraryModel: typeof Itinerary,
        private readonly configService: ConfigService
    ) {}

    async create(createItineraryDto: CreateItineraryDto): Promise<Itinerary> {
        // Map DTO to the required ItineraryCreationAttributes
 
        const itinerary = await this.itineraryModel.create(createItineraryDto);
        console.log(itinerary)
        this.logger.log(`Created itinerary: ${itinerary.id}`);
        return itinerary;
    }

    findAll(tripId: number) {
        return this.itineraryModel.findAll({
            where: { trip_id: tripId },
        });
    }

}
