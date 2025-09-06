export interface FSQRPlace {
	fsq_place_id: string;
	description: string;
	distance: number;
	name: string;
	rating: number;
	website: string;
	tel: string;
	price: number;
	hours: {
		display: string;
		is_local_holiday: boolean;
		open_now: boolean;
		regular: {
			[x: string]: unknown;
			close: string;
			day: number;
			open: string;
		}
	}[]
	location: {
		locality: string;
		region: string;
		postcode: string;
		country: string;
		formatted_address: string;
	}
	photos: {
		fsq_photo_id: string;
		created_at: string;
		prefix: string;
		suffix: string;
		width: number;
		height: number;
		classifications: string[];
	}[]
	categories: {
		fsq_category_id: string;
		name: string;
		short_name: string;
		plural_name: string;
		icon: {
			prefix: string;
			suffix: string;
		};
	}[];
	social_media: {
		facebook_id: string;
		twitter: string;
		instagram: string;
	}
	related_places: {
		children: {
			fsq_place_id: string;
			categories: {
				fsq_category_id: string;
				name: string;
				short_name: string;
				plural_name: string;
				icon: {
					prefix: string;
				}
			};
			name: string;
		}
	}
	stats: {
		total_photos: number;
		total_ratings: number;
		total_tips: number;
	};

}