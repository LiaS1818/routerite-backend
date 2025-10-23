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
import { UpdatePremiumDto } from './dto/update-premium.dto';
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

	@UseGuards(JwtAuthGuard)
	@Get('/me')
	async findOne(@Request() req) {
		return this.usersService.findOne(req.user.id);
	}

	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Patch('me/profile-picture')
	@UseGuards(JwtAuthGuard)
	async updateProfilePicture(
		@Body('profile_picture') profile_picture: string,
		@Request() req
	) {
		const user = await this.usersService.findOne(req.user.id);
		await user.update({ profile_picture });
		return user;
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
		if (updateUserDto.password == null) delete updateUserDto.password;
		return this.usersService.update(id, updateUserDto);
	}

	@Patch(':id/premium')
	@UseGuards(JwtAuthGuard)
	async updatePremiumStatus(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePremiumDto: UpdatePremiumDto,
		@Request() req
	) {
		// Only allow users to update their own premium status
		if (req.user.id !== id) {
			throw new HttpException(
				'Not authorized to update this user premium status',
				HttpStatus.FORBIDDEN
			);
		}
		return this.usersService.updatePremiumStatus(id, updatePremiumDto);
	}
}
