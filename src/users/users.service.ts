import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { CreateUserDto, UpdateUserDto } from './dto';
// import { SupabaseClient } from '@supabase/supabase-js'; // Assuming you have a Supabase client type
@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User)
		private userModel: typeof User,

		// @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient, // Injecting Supabase client
	) { }

	async findAll(): Promise<User[]> {
		return this.userModel.findAll();
	}

	async findOne(id: string): Promise<User | null> {
		return this.userModel.findByPk(id);
	}

	async checkEmailExists(email: string): Promise<User | null> {
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



	// Prueba con supabase
	// async getUsersSB(){
	// 	const { data, error} = await this.supabase
	// 		.from('user')
	// 		.select('*');
	// 	if (error) {
	// 		throw new Error(`Error fetching users from Supabase: ${error.message}`);
	// 	}
	// 	return data;
	// }

	// // insert user in supabase
	// async createUserSB(createUserDto: CreateUserDto) {
	// 	const { data, error } = await this.supabase
	// 		.from('users')
	// 		.insert([createUserDto])
	// 		.select('*') 
	// 		.single(); 

	// 	if (error) {
	// 		throw new Error(`Error creating user in Supabase: ${JSON.stringify(error)}`);
	// 	}
	// 	return data;
	// }
}
