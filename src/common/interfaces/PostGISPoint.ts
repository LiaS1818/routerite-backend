export interface PostGISPoint {
	type: 'Point';
	coordinates: [number, number]; // [longitud, latitud]
}