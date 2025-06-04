import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User)
		private userModel: typeof User,
	) { }

	async findAll(): Promise<User[]> {
		return this.userModel.findAll();
	}

	async findOne(id: string): Promise<User | null> {
		return this.userModel.findByPk(id);
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userModel.findOne({
			where: {
				email,
			},
		});
	}

	async create(createUserDto: CreateUserDto): Promise<User> {
		return this.userModel.create({
			...createUserDto,
		});
	}

	async update(id: string, updateUserDto: UpdateUserDto): Promise<[number, User[]]> {
		const [affectedCount, affectedRows] = await this.userModel.update(updateUserDto, {
			where: { id },
			returning: true,
		});
		return [affectedCount, affectedRows];
	}

	async remove(id: string): Promise<number> {
		return this.userModel.destroy({
			where: { id },
		});
	}
}
