export interface FsqCategory {
  id?: string | number;
  name?: string;
  // puedes agregar code/shortName si tu mock lo tiene
}
export interface FsqLocation {
  address?: string;
  locality?: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
}
export interface FsqHoursSpan {
  day?: number;           // 0=domingo ... 6=sábado
  open?: string;          // "HH:mm"
  close?: string;         // "HH:mm"
}
export interface FsqHours {
  regular?: FsqHoursSpan[];
}
export interface FsqPlace {
  fsq_id: string;
  name: string;
  location: FsqLocation;
  categories?: FsqCategory[];
  rating?: number;        // 0-10 o 0-5, según tu mock
  popularity?: number;    // algún score si lo tienes
  hours?: FsqHours;
}
