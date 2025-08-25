import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Itinerary, Trip, User, Activity } from 'src/database/models';
import { InjectModel } from '@nestjs/sequelize';
import { CreateItineraryDto } from './dto/create-itinerary.dto';

import { WhereOptions } from 'sequelize';

@Injectable()
export class ItinerariesService {
    private readonly logger = new Logger(ItinerariesService.name);

    constructor(
        @InjectModel(Itinerary)
        private readonly itineraryModel: typeof Itinerary,
        
        @InjectModel(Activity)
        private readonly activityModel: typeof Activity,
        
    ) {}

    async create(createItineraryDto: CreateItineraryDto): Promise<Itinerary> {
        this.logger.debug('DTO recibido:');
        this.logger.debug(JSON.stringify(createItineraryDto, null, 2));
        
        this.logger.debug('Tipos de datos:');
        Object.entries(createItineraryDto).forEach(([key, value]) => {
            this.logger.debug(`${key}: ${value} (${typeof value})`);
        });

        try {
            const itinerary = await this.itineraryModel.create(createItineraryDto as any);
            this.logger.log(`Created itinerary: ${itinerary.id}`);
            return itinerary;
        } catch (error) {
            this.logger.error('Error al crear itinerario:', error);
            throw error;
        }
    }

    async findAll(tripId: number): Promise<Itinerary[]> {
        return this.itineraryModel.findAll({
            where: { trip_id: tripId } as WhereOptions<Itinerary>,
        });
    }

    async getItineraryWithActivities(itineraryId: number) {
        try {
            const itinerary = await this.itineraryModel.findByPk(itineraryId, {
                include: [{
                    model: Activity,
                    as: 'activities',
                    attributes: [
                        'id', 
                        'description',
                        'time',
                        'location',
                        'budget',
                        'transportation_mode',
                        'img_url',
                        'day'
                    ],
                    order: [['time', 'ASC']],
                    required: false
                }],
            });

            if (!itinerary) {
                throw new NotFoundException(`Itinerary with ID ${itineraryId} not found`);
            }

            const activities = itinerary.activities || [];

            const groupedActivities = activities.reduce((acc, activity) => {
                // Usar el campo 'day' si existe, sino usar la fecha
                const dayKey = activity.day ? `Day ${activity.day}` : 
                              activity.time.toISOString().split('T')[0];
                
                if (!acc[dayKey]) acc[dayKey] = [];
                acc[dayKey].push({
                    id: activity.id,
                    description: activity.description,
                    time: activity.time,
                    location: activity.location,
                    budget: activity.budget,
                    transportation: activity.transportation_mode,
                    image: activity.img_url,
                    day: activity.day
                });
                return acc;
            }, {});

            return {
                id: itinerary.id,
                budget: itinerary.budget || itinerary.date, // ← Usar budget si existe
                date: itinerary.date,
                experience_type: itinerary.experience_type,
                activities: groupedActivities,
            };
        } catch (error) {
            this.logger.error('Error in getItineraryWithActivities:', error);
            throw error;
        }
    }

    // Método adicional para encontrar un itinerario por ID
    async findOne(id: number): Promise<Itinerary> {
        const itinerary = await this.itineraryModel.findByPk(id);
        if (!itinerary) {
            throw new NotFoundException(`Itinerary with ID ${id} not found`);
        }
        return itinerary;
    }

    // Método para eliminar itinerario
    async remove(id: number): Promise<void> {
        const itinerary = await this.findOne(id);
        await itinerary.destroy();
    }
}