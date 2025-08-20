import { User } from './user.model';
import { Trip } from './trip.model';
import { Itinerary } from './itinerary.model';


// Exportar modelos
export { User, Trip, Itinerary };

// Función para inicializar asociaciones después de que Sequelize esté configurado
export function initializeAssociations() {
	const models = {
		User,
		Trip,
		Itinerary
	};

	// Ejecutar las asociaciones de cada modelo
	Object.values(models).forEach((model: any) => {
		if (model.associate) {
			model.associate(models);
		}
	});

}
