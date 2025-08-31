import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../database/models/user.model';
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
		const existingUser = await this.userModel.findOne({
			where: { email: createUserDto.email },
		});

		if (existingUser) {
			throw new ConflictException('Email is already registered');
		}

		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
		const user = await this.userModel.create({
			...createUserDto,
			profile_picture: 'https://lvuodwyfoqekoeadpcyi.supabase.co/storage/v1/object/public/routerite/defaults/profile-pictures/default-profile-picture.png',
			password: hashedPassword
		});

		return this.userModel.findByPk(user.id, {
			attributes: { exclude: ['password'] },
		}) as Promise<User>;
	}

	async findAll(): Promise<User[]> {
		return this.userModel.findAll({
			attributes: { exclude: ['password'] },
			where: { active: true },
		});
	}

	async findOne(id: number): Promise<User> {
		const user = await this.userModel.findByPk(id, {
			attributes: { exclude: ['password'] },
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		return user;
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userModel.findOne({
			where: { email },
		});
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
		const user = await this.userModel.findByPk(id);

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		// If changing password, verify current password
		const updateData: any = { ...updateUserDto };

		if (updateUserDto.password) {
			// Hash the new password
			updateData.password = await bcrypt.hash(updateUserDto.password, 10);
		}
		await user.update(updateData);
		// Return user without password
		return this.userModel.findByPk(id, {
			attributes: { exclude: ['password'] },
		}) as Promise<User>;
	}

	async remove(id: number): Promise<{ success: boolean }> {
		const user = await this.userModel.findByPk(id);

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		// Soft delete
		await user.update({ active: false });
		await user.destroy();

		return { success: true };
	}

	/**
	 * Validate user password for authentication
	 * @param email User email
	 * @param password Password to validate
	 * @returns User object if credentials are valid, null otherwise
	 */
	async validatePassword(
		email: string,
		password: string
	): Promise<User | null> {
		const user = await this.userModel.findOne({
			where: { email },
		});

		if (!user) {
			return null;
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return null;
		}

		return user;
	}
}
