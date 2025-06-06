import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from '../database/models/user.model';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get()
	async findAll(): Promise<User[]> {
		return this.usersService.findAll();
	}
	
	@Get('/all')
	async findAllUsersSB(): Promise<User[]> {
		try {
			return await this.usersService.getUsersSB();
		}
		catch (error) {
			throw new HttpException(`Error fetching users from Supabase: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

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
}
