import { User } from './user.model';
import { Viaje } from './viaje.model';

// Exportar modelos
export { User, Viaje };

// Función para inicializar asociaciones después de que Sequelize esté configurado
export function initializeAssociations() {
	const models = {
		User,
		Viaje,
	};

	// Ejecutar las asociaciones de cada modelo
	Object.values(models).forEach((model: any) => {
		if (model.associate) {
			model.associate(models);
		}
	});
}
