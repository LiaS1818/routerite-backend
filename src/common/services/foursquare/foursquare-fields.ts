// ==================== NUEVAS INTERFACES Y TIPOS (FIELDS LEVEL) ====================

/**
 * Tipo de nivel de campos para las respuestas
 */
export type FoursquareFieldsLevel = 'basic' | 'pro' | 'premium' | 'custom';

/**
 * Definición de campos por nivel
 */
export class FoursquareFields {
	static readonly BASIC_FIELDS = [
		'fsq_id',
		'name',
		'geocodes',
		'location',
		'categories',
		'distance',
		'link',
		'timezone',
	];
	static readonly PRO_FIELDS = [
		...FoursquareFields.BASIC_FIELDS,
		'chains',
		'closed_bucket',
		'email',
		'hours',
		'hours_popular',
		'photos',
		'price',
		'rating',
		'related_places',
		'social_media',
		'stats',
		'tel',
		'verified',
		'website',
	];
	static readonly PREMIUM_FIELDS = [
		...FoursquareFields.PRO_FIELDS,
		'popularity',
		'tips',
		'tastes',
		'date_closed',
		'description',
		'menu',
		'store_id',
		'venuepage_id',
		'attributes',
		'features',
	];
	static getFieldsByLevel(
		level: FoursquareFieldsLevel,
		customFields?: string[]
	): string[] {
		switch (level) {
			case 'basic':
				return FoursquareFields.BASIC_FIELDS;
			case 'pro':
				return FoursquareFields.PRO_FIELDS;
			case 'premium':
				return FoursquareFields.PREMIUM_FIELDS;
			case 'custom':
				return customFields || FoursquareFields.BASIC_FIELDS;
			default:
				return FoursquareFields.BASIC_FIELDS;
		}
	}
	static validateFieldsForLevel(
		fields: string[],
		level: FoursquareFieldsLevel
	): {
		valid: boolean;
		invalidFields: string[];
		suggestedLevel?: FoursquareFieldsLevel;
	} {
		const allowedFields = FoursquareFields.getFieldsByLevel(level);
		const invalidFields = fields.filter(f => !allowedFields.includes(f));
		if (invalidFields.length === 0)
			return { valid: true, invalidFields: [] };
		let suggestedLevel: FoursquareFieldsLevel | undefined;
		if (fields.every(f => FoursquareFields.PRO_FIELDS.includes(f)))
			suggestedLevel = 'pro';
		else if (fields.every(f => FoursquareFields.PREMIUM_FIELDS.includes(f)))
			suggestedLevel = 'premium';
		return { valid: false, invalidFields, suggestedLevel };
	}
}
