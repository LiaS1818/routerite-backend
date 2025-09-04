import { FoursquareFieldsLevel } from '../foursquare-fields';

/**
 * Interface para los parámetros de búsqueda de lugares en Foursquare
 */
export interface FoursquarePlaceSearchRequest {
	// Parámetros de búsqueda principal
	query?: string; // Texto de búsqueda libre (ej: "coffee", "restaurant")

	// Parámetros de ubicación (al menos uno es requerido)
	ll?: string; // Latitud,Longitud (ej: "41.8781,-87.6298")
	near?: string; // Nombre de ubicación para geocoding (ej: "Chicago, IL")

	// Filtros de búsqueda
	radius?: number; // Radio de búsqueda en metros (max 100000)
	categories?: string; // IDs de categorías separadas por comas
	chains?: string; // IDs de cadenas separadas por comas
	exclude_chains?: string; // IDs de cadenas a excluir
	exclude_all_chains?: boolean; // Excluir todas las cadenas

	// Filtros adicionales
	open_now?: boolean; // Solo lugares abiertos ahora
	open_at?: string; // ISO 8601 timestamp para verificar apertura
	min_price?: number; // Precio mínimo (1-4)
	max_price?: number; // Precio máximo (1-4)

	// Paginación y ordenamiento
	limit?: number; // Número de resultados (max 50)
	sort?: 'relevance' | 'rating' | 'distance' | 'popularity'; // Criterio de ordenamiento

	// Campos adicionales a incluir
	fields?: string; // Campos adicionales separados por comas

	// Sesión de usuario para personalización
	session_token?: string; // Token de sesión único por usuario
}

export interface FoursquarePlaceSearchRequestExtended
	extends FoursquarePlaceSearchRequest {
	/**
	 * Nivel de campos a retornar
	 * - 'basic': Campos gratuitos básicos
	 * - 'pro': Campos Pro (gratuitos pero más detallados)
	 * - 'premium': Campos Premium (requieren plan de pago)
	 * - 'custom': Lista personalizada de campos
	 */
	fieldsLevel?: FoursquareFieldsLevel;
	/**
	 * Lista personalizada de campos cuando fieldsLevel es 'custom'
	 * Sobrescribe el campo 'fields' original
	 */
	customFields?: string[];
}
