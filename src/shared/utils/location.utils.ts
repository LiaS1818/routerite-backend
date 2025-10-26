export function latLngStringToObject(latLngString: string): { lat: string, lng: string } {

	// Buscar por nombre si está disponible
	const longitudeMatch = latLngString.match(/lng:\s*([-+]?\d*\.\d+|\d+)/) || [
		null,
		'0.0',
	];
	const longitude = longitudeMatch[1];
	const latitudeMatch = latLngString.match(/lat:\s*([-+]?\d*\.\d+|\d+),/) || [
		null,
		'0.0',
	];
	const latitude = latitudeMatch[1];

	return {
		lat: latitude,
		lng: longitude
	};
}