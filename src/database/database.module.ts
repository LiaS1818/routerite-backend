import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './config/database.config';
import { User } from './models/user.model';
import { Viaje } from './models/viaje.model';

@Module({
	imports: [
		SequelizeModule.forRoot({
			...databaseConfig,
			models: [User, Viaje],
		}),
	],
	exports: [SequelizeModule],
})
export class DatabaseModule implements OnModuleInit {
	async onModuleInit() {
		// Ejecutar asociaciones después de que todos los modelos estén cargados
		await this.initializeAssociations();
	}

	private async initializeAssociations() {
		console.log('🔗 Inicializando asociaciones de modelos...');

		// Objeto que mapea nombres de modelos a sus clases
		const models = {
			User,
			Viaje,
		};

		// Ejecutar el método associate de cada modelo si existe
		Object.values(models).forEach((model: any) => {
			if (model.associate && typeof model.associate === 'function') {
				console.log(`⚡ Configurando asociaciones para: ${model.name}`);
				model.associate(models);
			}
		});

		// Validar que las asociaciones se crearon correctamente
		this.validateAssociations();

		console.log('✅ Asociaciones inicializadas correctamente');
	}

	private validateAssociations() {
		// Verificar que User tiene la asociación 'viajes'
		if (!User.associations.viajes) {
			throw new Error('❌ Asociación User -> viajes no se estableció correctamente');
		}

		// Verificar que Viaje tiene la asociación 'usuario'
		if (!Viaje.associations.usuario) {
			throw new Error('❌ Asociación Viaje -> usuario no se estableció correctamente');
		}

		console.log('✅ Validación de asociaciones completada');
		console.log(`📋 User tiene ${Object.keys(User.associations).length} asociación(es)`);
		console.log(`📋 Viaje tiene ${Object.keys(Viaje.associations).length} asociación(es)`);
	}
}
