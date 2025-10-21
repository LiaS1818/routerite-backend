export interface FsqCategory {
  fsq_category_id: string;
  name: string;
  short_name?: string;
  plural_name?: string;
  icon?: {
    prefix: string;
    suffix: string;
  };
}

export interface FsqPhoto {
  fsq_photo_id: string;
  created_at: string;
  prefix: string;
  suffix: string;
  width: number;
  height: number;
  classifications?: string[];
}

export interface FsqHoursSpan {
  day?: number;        // 1–7 en el mock (Foursquare usa 1 = Monday)
  open?: string;       // "HHmm" o "0000"
  close?: string;      // "HHmm" o "+0000"
}

export interface FsqHours {
  display?: string;
  is_local_holiday?: boolean;
  open_now?: boolean;
  regular?: FsqHoursSpan[];
}

export interface FsqStats {
  total_photos?: number;
  total_ratings?: number;
  total_tips?: number;
}

export interface FsqLocation {
  address?: string;
  locality?: string;
  region?: string;
  postcode?: string;
  country?: string;
  formatted_address?: string;
  lat?: number;        // algunos mocks no los tienen
  lng?: number;
}

export interface FsqRelatedPlace {
  fsq_place_id?: string;
  name?: string;
  categories?: FsqCategory[];
}

export interface FsqRelatedPlaces {
  children?: FsqRelatedPlace[];
}

export interface FsqSocialMedia {
  facebook_id?: string;
  twitter?: string;
  instagram?: string;
}

export interface FsqPlace {
  name: string;
  description?: string;
  location: FsqLocation;
  distance: number;
  categories?: FsqCategory[];
  photos?: FsqPhoto[];
  hours?: FsqHours;
  rating?: number;
  price?: number;
  stats?: FsqStats;
  related_places?: FsqRelatedPlaces;
  social_media?: FsqSocialMedia;
  website?: string;
  tel?: string;
  // Propiedades internas usadas por tu servicio (no vienen del mock)
  __distance?: number;
  __relevance?: number;
}
