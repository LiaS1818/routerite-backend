// lugar.entity.ts
export class SocialMedia {
	facebook_id: string;
	instagram: string;
	twitter: string;
}

export class Category {
	id: number;
	name: string;
	short_name: string;
	plural_name: string;
	icon: {
		prefix: string;
		suffix: string;
	};
}

export class Geocodes {
	drop_off: {
		latitude: number;
		longitude: number;
	};
	main: {
		latitude: number;
		longitude: number;
	};
}

export class Hours {
	display: string;
	is_local_holiday: boolean;
	open_now: boolean;
	regular: Array<{
		day: number;
		open: string;
		close: string;
	}>;
}

export class Location {
	address: string;
	country: string;
	cross_street: string;
	formatted_address: string;
	locality: string;
	postcode: string;
	region: string;
}

export class Photo {
	id: string;
	created_at: string;
	prefix: string;
	suffix: string;
	width: number;
	height: number;
}

export class RelatedPlaces {
	children: any[];
}

export class Place {
	fsq_id: string;
	name: string;
	description: string;
	distance: number;
	price: number;
	rating: number;
	social_media: SocialMedia;
	tel: string;
	website: string;
	categories: Category[];
	geocodes: Geocodes;
	hours: Hours;
	location: Location;
	photos: Photo[];
	related_places: RelatedPlaces;
}
