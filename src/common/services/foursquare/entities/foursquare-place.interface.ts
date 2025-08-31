import { FoursquareLocationInterface } from './foursquare-location.interface';

export interface FoursquareGeocodes {
	drop_off?: { latitude: number; longitude: number };
	main?: { latitude: number; longitude: number };
	roof?: { latitude: number; longitude: number };
}

export interface FoursquareCategory {
	id: number;
	name: string;
	short_name?: string;
	plural_name?: string;
	icon?: { prefix: string; suffix: string };
}

export interface FoursquareChain {
	id: string;
	name: string;
}

export interface FoursquareHours {
	display?: string;
	is_local_holiday?: boolean;
	open_now?: boolean;
	regular?: Array<{ close: string; day: number; open: string }>;
}

export interface FoursquareStats {
	total_photos?: number;
	total_ratings?: number;
	total_tips?: number;
}

export interface FoursquarePlaceInterface {
	fsq_id: string;
	name: string;
	location?: FoursquareLocationInterface;
	geocodes?: FoursquareGeocodes;
	distance?: number;
	timezone?: string;
	categories?: FoursquareCategory[];
	chains?: FoursquareChain[];
	closed_bucket?: string;
	hours?: FoursquareHours;
	hours_popular?: Array<{ close: string; day: number; open: string }>;
	link?: string;
	related_places?: { parent?: FoursquarePlaceInterface; children?: FoursquarePlaceInterface[] };
	rating?: number;
	price?: number;
	stats?: FoursquareStats;
	popularity?: number;
	photos?: Array<{
		id: string;
		created_at: string;
		prefix: string;
		suffix: string;
		width: number;
		height: number;
		classifications?: string[];
	}>;
	verified?: boolean;
	description?: string;
	tel?: string;
	email?: string;
	website?: string;
	social_media?: {
		facebook_id?: string;
		instagram?: string;
		twitter?: string;
	};
	date_closed?: string;
}