import {
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Op, Transaction, FindOptions } from 'sequelize';
import { Viaje } from '../database/models/viaje.model';
import { User } from '../database/models/user.model';
import {
	ViajeFiltersInterface,
	ViajeStatsInterface,
	PaginatedResult,
} from '../interfaces/viaje.interfaces';

@Injectable()
export class ViajesRepository {
	private readonly logger = new Logger(ViajesRepository.name);

	constructor(
		@InjectModel(Viaje)
		private readonly viajeModel: typeof Viaje,
		@InjectModel(User)
		private readonly userModel: typeof User,
		private readonly configService: ConfigService
	) {}

	/**
	 * Crear nuevo viaje en base de datos
	 */
	async create(
		createData: Partial<Viaje>,
		transaction?: Transaction
	): Promise<Viaje> {
		try {
			this.logger.log(
				`Creando nuevo viaje para usuario ${createData.usuario_id}`
			);

			const viaje = await this.viajeModel.create(createData as any, {
				transaction,
				include: [
					{
						model: this.userModel,
						as: 'usuario',
						attributes: ['id', 'nombre', 'correo'],
					},
				],
			});

			this.logger.log(`Viaje creado exitosamente con ID: ${viaje.id}`);
			return viaje;
		} catch (error) {
			this.logger.error(
				`Error al crear viaje: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Obtener todos los viajes de un usuario
	 */
	async findByUserId(
		userId: number,
		options: FindOptions = {}
	): Promise<Viaje[]> {
		try {
			this.logger.log(`Obteniendo viajes para usuario ${userId}`);

			const defaultOptions: FindOptions = {
				where: { usuario_id: userId },
				order: [['fecha_inicio', 'DESC']],
				include: [
					{
						model: this.userModel,
						as: 'usuario',
						attributes: ['id', 'nombre', 'correo'],
					},
				],
				paranoid: true,
			};

			const viajes = await this.viajeModel.findAll({
				...defaultOptions,
				...options,
			});

			this.logger.log(
				`Encontrados ${viajes.length} viajes para usuario ${userId}`
			);
			return viajes;
		} catch (error) {
			this.logger.error(
				`Error al obtener viajes del usuario ${userId}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Obtener viaje específico verificando ownership
	 */
	async findByIdAndUser(id: number, userId: number): Promise<Viaje | null> {
		try {
			this.logger.log(`Obteniendo viaje ${id} para usuario ${userId}`);

			const viaje = await this.viajeModel.findOne({
				where: {
					id,
					usuario_id: userId,
				},
				include: [
					{
						model: this.userModel,
						as: 'usuario',
						attributes: ['id', 'nombre', 'correo', 'telefono'],
					},
				],
				paranoid: true,
			});

			if (!viaje) {
				this.logger.warn(
					`Viaje ${id} no encontrado para usuario ${userId}`
				);
				return null;
			}

			this.logger.log(`Viaje ${id} encontrado exitosamente`);
			return viaje;
		} catch (error) {
			this.logger.error(
				`Error al obtener viaje ${id}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Actualizar viaje verificando ownership
	 */
	async updateByIdAndUser(
		id: number,
		userId: number,
		updateData: Partial<Viaje>,
		transaction?: Transaction
	): Promise<Viaje> {
		try {
			this.logger.log(`Actualizando viaje ${id} para usuario ${userId}`);

			// Verificar que el viaje existe y pertenece al usuario
			const viaje = await this.findByIdAndUser(id, userId);
			if (!viaje) {
				throw new NotFoundException(
					`Viaje con ID ${id} no encontrado para el usuario`
				);
			}

			// Actualizar el viaje
			await viaje.update(updateData, { transaction });

			// Recargar con asociaciones
			await viaje.reload({
				include: [
					{
						model: this.userModel,
						as: 'usuario',
						attributes: ['id', 'nombre', 'correo'],
					},
				],
				transaction,
			});

			this.logger.log(`Viaje ${id} actualizado exitosamente`);
			return viaje;
		} catch (error) {
			this.logger.error(
				`Error al actualizar viaje ${id}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Eliminación suave verificando ownership
	 */
	async softDeleteByIdAndUser(
		id: number,
		userId: number,
		transaction?: Transaction
	): Promise<boolean> {
		try {
			this.logger.log(`Eliminando viaje ${id} para usuario ${userId}`);

			// Verificar que el viaje existe y pertenece al usuario
			const viaje = await this.findByIdAndUser(id, userId);
			if (!viaje) {
				throw new NotFoundException(
					`Viaje con ID ${id} no encontrado para el usuario`
				);
			}

			// No permitir eliminar viajes activos
			if (viaje.isActive()) {
				throw new BadRequestException(
					'No se puede eliminar un viaje que está actualmente en curso'
				);
			}

			// Realizar eliminación suave
			await viaje.destroy({ transaction });

			this.logger.log(`Viaje ${id} eliminado exitosamente`);
			return true;
		} catch (error) {
			this.logger.error(
				`Error al eliminar viaje ${id}: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Búsqueda avanzada con filtros múltiples
	 */
	async findByFilters(
		userId: number,
		filters: ViajeFiltersInterface
	): Promise<PaginatedResult<Viaje>> {
		try {
			this.logger.log(
				`Aplicando filtros de búsqueda para usuario ${userId}`,
				filters
			);

			const whereClause: any = { usuario_id: userId };

			// Aplicar filtros
			if (filters.fechaInicio) {
				whereClause.fecha_inicio = { [Op.gte]: filters.fechaInicio };
			}

			if (filters.fechaFin) {
				whereClause.fecha_fin = { [Op.lte]: filters.fechaFin };
			}

			if (filters.tipoExperiencia) {
				whereClause.tipo_experiencia = filters.tipoExperiencia;
			}

			if (filters.status) {
				whereClause.status = filters.status;
			}

			if (filters.presupuestoMin || filters.presupuestoMax) {
				whereClause.presupuesto_total = {};
				if (filters.presupuestoMin) {
					whereClause.presupuesto_total[Op.gte] =
						filters.presupuestoMin;
				}
				if (filters.presupuestoMax) {
					whereClause.presupuesto_total[Op.lte] =
						filters.presupuestoMax;
				}
			}

			if (filters.destino) {
				whereClause.destino = {
					[Op.iLike]: `%${filters.destino}%`,
				};
			}

			// Configurar paginación
			const limit = filters.limit || 10;
			const offset = filters.offset || 0;
			const page = Math.floor(offset / limit) + 1;

			// Configurar ordenamiento
			const orderBy = filters.orderBy || 'fecha_inicio';
			const orderDirection = filters.orderDirection || 'DESC';

			// Ejecutar consulta con conteo
			const { rows: viajes, count: total } =
				await this.viajeModel.findAndCountAll({
					where: whereClause,
					include: [
						{
							model: this.userModel,
							as: 'usuario',
							attributes: ['id', 'nombre', 'correo'],
						},
					],
					limit,
					offset,
					order: [[orderBy, orderDirection]],
					paranoid: true,
				});

			const totalPages = Math.ceil(total / limit);

			this.logger.log(
				`Búsqueda completada: ${viajes.length} resultados de ${total} total`
			);

			return {
				data: viajes,
				total,
				page,
				limit,
				totalPages,
			};
		} catch (error) {
			this.logger.error(
				`Error en búsqueda con filtros: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Viajes futuros del usuario
	 */
	async findUpcomingByUser(userId: number): Promise<Viaje[]> {
		try {
			this.logger.log(
				`Obteniendo viajes próximos para usuario ${userId}`
			);

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const viajes = await this.viajeModel.findAll({
				where: {
					usuario_id: userId,
					fecha_inicio: { [Op.gte]: today },
					status: { [Op.notIn]: ['cancelled', 'completed'] },
				},
				order: [['fecha_inicio', 'ASC']],
				limit: 10,
				paranoid: true,
			});

			this.logger.log(`Encontrados ${viajes.length} viajes próximos`);
			return viajes;
		} catch (error) {
			this.logger.error(
				`Error al obtener viajes próximos: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Verificar overlapping de fechas
	 */
	async findByDateRange(
		userId: number,
		startDate: Date,
		endDate: Date
	): Promise<Viaje[]> {
		try {
			this.logger.log(
				`Verificando viajes en rango de fechas para usuario ${userId}`
			);

			const viajes = await this.viajeModel.findAll({
				where: {
					usuario_id: userId,
					[Op.or]: [
						{
							fecha_inicio: {
								[Op.between]: [startDate, endDate],
							},
						},
						{
							fecha_fin: {
								[Op.between]: [startDate, endDate],
							},
						},
						{
							[Op.and]: [
								{ fecha_inicio: { [Op.lte]: startDate } },
								{ fecha_fin: { [Op.gte]: endDate } },
							],
						},
					],
					status: { [Op.notIn]: ['cancelled'] },
				},
				attributes: [
					'id',
					'fecha_inicio',
					'fecha_fin',
					'destino',
					'status',
				],
				paranoid: true,
			});

			this.logger.log(
				`Encontrados ${viajes.length} viajes en el rango de fechas`
			);
			return viajes;
		} catch (error) {
			this.logger.error(
				`Error al verificar rango de fechas: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Estadísticas agregadas del usuario
	 */
	async getViajeStats(userId: number): Promise<ViajeStatsInterface> {
		try {
			this.logger.log(`Generando estadísticas para usuario ${userId}`);

			// Obtener todos los viajes del usuario
			const viajes = await this.viajeModel.findAll({
				where: { usuario_id: userId },
				attributes: [
					'status',
					'presupuesto_total',
					'destino',
					'tipo_experiencia',
				],
				paranoid: true,
			});

			// Calcular estadísticas
			const totalViajes = viajes.length;

			const viajesPorStatus = {
				draft: viajes.filter(v => v.status === 'draft').length,
				planned: viajes.filter(v => v.status === 'planned').length,
				active: viajes.filter(v => v.status === 'active').length,
				completed: viajes.filter(v => v.status === 'completed').length,
				cancelled: viajes.filter(v => v.status === 'cancelled').length,
			};

			const presupuestoTotalGastado = viajes
				.filter(v => v.status === 'completed')
				.reduce((sum, v) => sum + Number(v.presupuesto_total), 0);

			const destinosUnicos = [...new Set(viajes.map(v => v.destino))];

			// Calcular tipo de experiencia más frecuente
			const experienciaCount = viajes.reduce(
				(acc, v) => {
					acc[v.tipo_experiencia] =
						(acc[v.tipo_experiencia] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>
			);

			const tipoExperienciaMasFrecuente =
				Object.entries(experienciaCount).reduce((a, b) =>
					experienciaCount[a[0]] > experienciaCount[b[0]] ? a : b
				)?.[0] || '';

			const stats: ViajeStatsInterface = {
				totalViajes,
				viajesPorStatus,
				presupuestoTotalGastado,
				destinosUnicos,
				tipoExperienciaMasFrecuente,
			};

			this.logger.log(
				`Estadísticas generadas exitosamente para usuario ${userId}`
			);
			return stats;
		} catch (error) {
			this.logger.error(
				`Error al generar estadísticas: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}
}
