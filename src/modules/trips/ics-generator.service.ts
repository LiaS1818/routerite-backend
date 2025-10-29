import { Injectable, Logger } from '@nestjs/common';
import ical, { ICalCalendar, ICalEventData } from 'ical-generator';
import { Trip } from '../../database/models/trip.model';
import { Itinerary } from '../../database/models/itinerary.model';
import { Activity } from '../../database/models/activity.model';

@Injectable()
export class IcsGeneratorService {
	private readonly logger = new Logger(IcsGeneratorService.name);

	/**
	 * Genera un archivo .ics a partir de un Trip con sus itinerarios y actividades
	 * @param trip El trip del cual generar el archivo ICS
	 * @param itineraries Los itinerarios del trip con sus actividades
	 * @returns El contenido del archivo .ics como string
	 */
	generateIcsFromTrip(trip: Trip, itineraries: Itinerary[]): string {
		try {
			this.logger.debug(`Generando archivo ICS para trip ${trip.id}`);

			// Crear el calendario
			const calendar: ICalCalendar = ical({
				name: `${trip.destination} - RouteRite`,
				description: `Itinerario para el viaje a ${trip.destination}`,
				timezone: 'UTC',
				prodId: {
					company: 'RouteRite',
					product: 'RouteRite Trip Planner',
					language: 'ES'
				}
			});

			// Filtrar solo itinerarios que tengan al menos una actividad
			const itinerariesWithActivities = itineraries.filter(
				itinerary => itinerary.activities && itinerary.activities.length > 0
			);

			if (itinerariesWithActivities.length === 0) {
				this.logger.warn(`El trip ${trip.id} no tiene itinerarios con actividades`);
			}

			// Añadir eventos por cada actividad en cada itinerario
			for (const itinerary of itinerariesWithActivities) {
				if (!itinerary.activities) continue;

				for (const activity of itinerary.activities) {
					const event = this.createEventFromActivity(
						activity,
						itinerary,
						trip
					);
					calendar.createEvent(event);
				}
			}

			const icsContent = calendar.toString();
			this.logger.debug(
				`Archivo ICS generado exitosamente para trip ${trip.id}. ` +
				`${itinerariesWithActivities.length} itinerarios, ` +
				`${itinerariesWithActivities.reduce((sum, it) => sum + (it.activities?.length || 0), 0)} actividades`
			);

			return icsContent;
		} catch (error) {
			this.logger.error(
				`Error generando archivo ICS para trip ${trip.id}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Crea un evento de iCalendar a partir de una actividad
	 */
	private createEventFromActivity(
		activity: Activity,
		itinerary: Itinerary,
		trip: Trip
	): ICalEventData {
		// Combinar la fecha del itinerario con las horas de inicio y fin de la actividad
		const eventDate = new Date(itinerary.date);

		// Parsear start_time y end_time (formato HH:MM:SS)
		const startTime = this.parseTime(activity.start_time);
		const endTime = this.parseTime(activity.end_time);

		// Crear fechas completas
		const startDate = new Date(eventDate);
		startDate.setHours(startTime.hours, startTime.minutes, startTime.seconds);

		const endDate = new Date(eventDate);
		endDate.setHours(endTime.hours, endTime.minutes, endTime.seconds);

		// Construir la descripción del evento
		const description = this.buildActivityDescription(activity, trip);

		// Crear la ubicación del evento
		const location = activity.place?.name || `${activity.lat}, ${activity.lng}`;

		return {
			start: startDate,
			end: endDate,
			summary: activity.name,
			description: description,
			location: location,
			url: activity.place?.website || undefined,
			categories: [
				{
					name: trip.destination
				}
			],
			organizer: {
				name: 'RouteRite',
				email: 'noreply@routerite.com'
			}
		};
	}

	/**
	 * Parsea un string de tiempo en formato HH:MM:SS
	 */
	private parseTime(timeString: string): { hours: number; minutes: number; seconds: number } {
		if (!timeString) {
			return { hours: 0, minutes: 0, seconds: 0 };
		}

		const parts = timeString.split(':');
		return {
			hours: parseInt(parts[0] || '0', 10),
			minutes: parseInt(parts[1] || '0', 10),
			seconds: parseInt(parts[2] || '0', 10)
		};
	}

	/**
	 * Construye una descripción detallada de la actividad
	 */
	private buildActivityDescription(activity: Activity, trip: Trip): string {
		const parts: string[] = [];

		parts.push(activity.description);
		parts.push('');

		// Información de transporte
		if (activity.transportation_mode) {
			parts.push(`Modo de transporte: ${activity.transportation_mode}`);
		}

		if (activity.transportation_duration) {
			parts.push(`Duración del transporte: ${activity.transportation_duration} min`);
		}

		// Presupuesto
		if (activity.budget) {
			parts.push(`Presupuesto: $${activity.budget.toFixed(2)}`);
		}

		// Notas adicionales
		if (activity.notes) {
			parts.push('');
			parts.push('Notas:');
			parts.push(activity.notes);
		}

		// Información del lugar
		if (activity.place) {
			parts.push('');
			parts.push('--- Información del lugar ---');

			if (activity.place.location.formatted_address) {
				parts.push(`Dirección: ${activity.place.location.formatted_address}`);
			}

			if (activity.place.tel) {
				parts.push(`Teléfono: ${activity.place.tel}`);
			}
		}

		parts.push('');
		parts.push(`Generado por RouteRite - Viaje: ${trip.destination}`);

		return parts.join('\n');
	}
}