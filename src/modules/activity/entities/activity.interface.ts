// src/modules/activity/entities/activity.interface.ts
import { Optional } from 'sequelize';

export interface ActivityAttributes {
	id: number;
	name: string;
	description: string;
	time: Date;
	lat: number;
	lng: number;
	category_name: string;
	category_fsqr_id: string;
	distance_to_start: number;
	budget: number;
	price: number;
	location: any; // JSON type
	transportation_mode: string;
	img_url?: string;
	itinerary_id: number;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date;
}

export interface ActivityCreationAttributes
	extends Optional<
		ActivityAttributes,
		'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'img_url'
	> {}
