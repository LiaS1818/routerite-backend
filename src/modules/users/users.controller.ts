import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	UseGuards,
	Request,
	HttpException,
	HttpStatus,
	Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('/all')
	async findAll() {
		return this.usersService.findAll();
	}

	@Get('/check-email')
	async checkEmail(
		@Query('email') email: string
	): Promise<{ exists: boolean }> {
		const user = await this.usersService.findByEmail(email);
		return { exists: !!user };
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.findOne(id);
	}

	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
		@Request() req
	) {
		// Only allow users to update their own profile
		if (req.user.id !== id) {
			throw new HttpException(
				'Not authorized to update this profile',
				HttpStatus.FORBIDDEN
			);
		}
		return this.usersService.update(id, updateUserDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
		// Only allow users to delete their own profile
		if (req.user.id !== id) {
			throw new HttpException(
				'Not authorized to delete this profile',
				HttpStatus.FORBIDDEN
			);
		}
		return this.usersService.remove(id);
	}

	@Get('/trips/home')
	getViajes() {
    // Aquí podrías traer datos desde la base de datos, pero por ahora es mock
    const viajes = [
      {
        id: 1,
        nombre: 'Viaje a París',
        fecha: '2025-09-10',
        imagen_url: 'https://ejemplo.com/paris.jpg',
		status: 'active'
      },
      {
        id: 2,
        nombre: 'Viaje a Roma',
        fecha: '2025-10-05',
        imagen_url: 'https://ejemplo.com/roma.jpg',
		status: 'inactive'
      },
      {
        id: 3,
        nombre: 'Viaje a Tokio',
        fecha: '2025-11-20',
        imagen_url: 'https://ejemplo.com/tokio.jpg',
		status: 'inactive'
      }
    ];

    // Retornamos en formato JSON
    return { viajes };
	}
}
