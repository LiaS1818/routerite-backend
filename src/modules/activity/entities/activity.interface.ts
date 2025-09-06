// src/modules/activity/entities/activity.interface.ts
import { Optional } from 'sequelize';

export interface ActivityAttributes {
	id: number;
	name: string;
	description: string;
	start_time: Date;
	lat: string; // Changed from number to string
	lng: string; // Changed from number to string
	category_name: string;
	category_fsqr_id: string;
	distance_to_start: number;
	budget: number;
	price: number;
	location: any; // JSON type
	transportation_mode: string;
	img_url?: string | null; // Added null type for nullable field
	itinerary_id: number;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date | null; // Added null type for nullable field
}

export interface ActivityCreationAttributes
	extends Optional<
		ActivityAttributes,
		'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'img_url'
	> {}
