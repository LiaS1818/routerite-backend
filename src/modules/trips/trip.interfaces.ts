// filepath: /home/cardonapablo/Documentos/Proyectos/RouteRite/routerite-backend/src/modules/trips/trip.interfaces.ts
import { Trip } from '../../database/models/trip.model';

export interface TripFiltersInterface {
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  travelersCount?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResult {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LocationInterface {
  latLng: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}
