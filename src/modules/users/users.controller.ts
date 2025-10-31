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
	Render
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

	@Get('privacy')
	@Render('view/privacy.hbs') 
	getPrivacyView() {
	  // aquí pasas las variables/flags que usa el HBS
	  return {
		layout: false,                 // si no usas layout.hbs
		appName: 'RouteRite',
		companyName: 'Tu Empresa S.A. de C.V.',
		legalEntity: 'RFC/ID fiscal',
		websiteUrl: 'https://tu-dominio.com',
		contactEmail: 'soporte@tu-dominio.com',
		lastUpdated: '30 de octubre de 2025',
		year: new Date().getFullYear(),
  
		// Flags/condiciones según tu app:
		accountRegistration: true,
		camera: true,
		cameraPurpose: 'escanear códigos QR de actividades',
		cameraSaves: false,
		cameraStorage: 'en el dispositivo/localmente',
		cameraOptional: true,
  
		photos: false,
		location: false,
		locationPrecision: 'aproximada',
		locationPurpose: 'mostrar lugares cercanos',
  
		analytics: true,
		crashReports: true,
		payments: false,
		sharesData: false,
		processesSensitiveData: false,
		retention: 'Conservamos registros analíticos agregados por 12 meses.',
  
		thirdParties: [
		  // { name: 'Sentry', purpose: 'monitoreo de errores', data: 'crash logs, metadatos técnicos', policyUrl: 'https://sentry.io/privacy/' }
		],
  
		legalBasis: 'consentimiento del usuario y ejecución del contrato (uso de la app)',
		extraSecurity: 'Controles de roles y mínimos privilegios en el backend.',
		childPolicy: null,
		termsUrl: 'https://tu-dominio.com/terminos',
	  };
	}
}
