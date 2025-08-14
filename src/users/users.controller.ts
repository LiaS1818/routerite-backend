import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, HttpException, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from '../database/models/user.model';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guards';
import e from 'express';

//@UseGuards(ApiKeyGuard) 

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get('/all')
	async findAll(): Promise<User[]> {
		return this.usersService.findAll();
	}

	@Get('/check-email') // email enviado en la url
	async checkEmail(@Query('email') email: string): Promise<{ exists: boolean }> {
		var exists = await this.usersService.checkEmailExists(email);
		console.log('Email check:', email, 'Exists:', exists);

		return { exists: !!exists} // Convierte a booleano
	}


	// @Get('/all')
	// async findAllUsersSB(): Promise<User[]> {
	// 	try {

	// 		//from Supabase
	// 		const users = await this.usersService.getUsersSB();
	// 		if (!users) {
	// 			throw new HttpException('No users found', HttpStatus.NOT_FOUND);
	// 		}
	// 		console.log(users);
	// 		return users as User[];
	// 	}
	// 	catch (error) {
	// 		throw new HttpException(`Error fetching users from Supabase: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
	// 	}
	// }

	// @Post()
	// async createUserSB(@Body() createUserDto: CreateUserDto): Promise<User> {
	// 	try {
			
	// 		const { data, error } = await this.usersService.createUserSB(createUserDto);
	// 		if (error) {
	// 			throw new HttpException(`Error creating user in Supabase: ${error.message}`, HttpStatus.BAD_REQUEST);
	// 		}

	// 		return data as User;
	// 	}
	// 	catch (error) {
	// 		throw new HttpException(`Error creating user: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
	// 	}
	// }

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<User> {
		const user = await this.usersService.findOne(id);
		if (!user) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		return user;
	}

	@Post()
	async create(@Body() createUserDto: CreateUserDto): Promise<User> {
		try {
			return await this.usersService.create(createUserDto);
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
			}
			throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
		const [affected, [updatedUser]] = await this.usersService.update(id, updateUserDto);
		if (affected === 0) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		return updatedUser;
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		const deleted = await this.usersService.remove(id);
		if (deleted === 0) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
	}

  @Get('trips/home')
  
  async getHomeTrips(): Promise<{ currentTrip: string }> {
	console.log("si")
	// debo retornar un json con: $.currentTrip
	return { currentTrip: 'juashabos' };
  }
}
