import {
	Controller,
	Post,
	Body,
	HttpCode,
	HttpStatus,
	UseGuards,
	Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dtos/singup.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/resert-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	@HttpCode(HttpStatus.CREATED)
	async signup(@Body() signupDto: SignupDto) {
		return this.authService.signup(signupDto);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Post('forgot-password')
	@HttpCode(HttpStatus.OK)
	async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		return this.authService.forgotPassword(forgotPasswordDto);
	}

	@Post('reset-password')
	@HttpCode(HttpStatus.OK)
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		return this.authService.resetPassword(resetPasswordDto);
	}

	@Post('validate-token')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	async validateToken(@Request() req) {
		return {
			valid: true,
			user: {
				id: req.user.id,
				correo: req.user.correo,
				nombre: req.user.nombre,
			},
		};
	}
}
