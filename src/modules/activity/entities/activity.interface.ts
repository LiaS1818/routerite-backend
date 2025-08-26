// src/modules/activity/entities/activity.interface.ts
import { Optional } from 'sequelize';

export interface ActivityAttributes {
	id: number;
	itinerary_id: number;
	description: string;
	time: Date;
	location: string;
	presupuesto: number;
	transportation_mode: string;
	img_url: string;
	day: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

export interface ActivityCreationAttributes
	extends Optional<
		ActivityAttributes,
		'id' | 'created_at' | 'updated_at' | 'deleted_at'
	> {}
