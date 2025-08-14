import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User)
		private userModel: typeof User
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		// Verificar si el correo ya existe
		const existingUser = await this.userModel.findOne({
			where: { correo: createUserDto.correo },
		});

		if (existingUser) {
			throw new ConflictException(
				'El correo electrónico ya está registrado'
			);
		}

		// Hashear la contraseña
		const hashedPassword = await bcrypt.hash(createUserDto.contrasena, 10);

		// Crear el usuario
		const user = await this.userModel.create({
			...createUserDto,
			contrasena: hashedPassword,
		});

		// Recargar sin la contraseña
		return this.userModel.findByPk(user.id, {
			attributes: { exclude: ['contrasena'] },
		}) as Promise<User>;
	}

	async findAll(): Promise<User[]> {
		return this.userModel.findAll({
			attributes: { exclude: ['contrasena'] },
			where: { activo: true },
		});
	}

	async findOne(id: number): Promise<User> {
		const user = await this.userModel.findByPk(id, {
			attributes: { exclude: ['contrasena'] },
		});

		if (!user) {
			throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
		}

		return user;
	}

	async findByCorreo(correo: string): Promise<User | null> {
		return this.userModel.findOne({
			where: { correo },
		});
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
		const user = await this.userModel.findByPk(id);

		if (!user) {
			throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
		}

		// Si se va a cambiar la contraseña, verificar la actual
		const updateData: UpdateUserDto = { ...updateUserDto };

		if (updateUserDto.nueva_contrasena) {
			if (!updateUserDto.contrasena_actual) {
				throw new BadRequestException(
					'Se requiere la contraseña actual para cambiarla'
				);
			}

			const isCurrentPasswordValid = await bcrypt.compare(
				updateUserDto.contrasena_actual,
				user.contrasena
			);

			if (!isCurrentPasswordValid) {
				throw new BadRequestException(
					'La contraseña actual es incorrecta'
				);
			}

			// Hashear la nueva contraseña
			updateData.contrasena = await bcrypt.hash(
				updateUserDto.nueva_contrasena,
				10
			);
			delete updateData.nueva_contrasena;
			delete updateData.contrasena_actual;
		}

		// Verificar si el nuevo correo ya existe (si se está cambiando)
		if (updateUserDto.correo && updateUserDto.correo !== user.correo) {
			const existingUser = await this.userModel.findOne({
				where: { correo: updateUserDto.correo },
			});

			if (existingUser) {
				throw new ConflictException(
					'El correo electrónico ya está registrado'
				);
			}
		}

		await user.update(updateData);

		// Retornar usuario actualizado sin contraseña
		return this.userModel.findByPk(user.id, {
			attributes: { exclude: ['contrasena'] },
		}) as Promise<User>;
	}

	async remove(id: number): Promise<void> {
		const user = await this.userModel.findByPk(id);

		if (!user) {
			throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
		}

		await user.update({ activo: false });
	}

	async validatePassword(
		correo: string,
		contrasena: string
	): Promise<User | null> {
		const user = await this.findByCorreo(correo);

		if (user && (await bcrypt.compare(contrasena, user.contrasena))) {
			return user;
		}

		return null;
	}
}
