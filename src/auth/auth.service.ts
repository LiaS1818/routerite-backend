import {
	Injectable,
	UnauthorizedException,
	ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto, LoginDto } from './dtos/singup.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/resert-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	) {}

	async signup(signupDto: SignupDto) {
		try {
			const user = await this.usersService.create(signupDto);

			const payload = { correo: user.correo, sub: user.id };
			const access_token = this.jwtService.sign(payload);

			return {
				access_token,
				user: {
					id: user.id,
					nombre: user.nombre,
					correo: user.correo,
					verificado: user.verificado,
				},
			};
		} catch (error) {
			if (error instanceof ConflictException) {
				throw error;
			}
			throw new Error('Error al crear la cuenta');
		}
	}

	async login(loginDto: LoginDto) {
		const user = await this.usersService.validatePassword(
			loginDto.correo,
			loginDto.contrasena
		);

		if (!user) {
			throw new UnauthorizedException('Credenciales inválidas');
		}

		if (!user.activo) {
			throw new UnauthorizedException('Cuenta desactivada');
		}

		const payload = { correo: user.correo, sub: user.id };
		const access_token = this.jwtService.sign(payload);

		return {
			access_token,
			user: {
				id: user.id,
				nombre: user.nombre,
				correo: user.correo,
				verificado: user.verificado,
			},
		};
	}

	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const user = await this.usersService.findByCorreo(
			forgotPasswordDto.correo
		);

		if (!user) {
			// Por seguridad, no revelamos si el correo existe o no
			return {
				message:
					'Si el correo existe, recibirás instrucciones para recuperar tu contraseña',
			};
		}

		// Generar token de recuperación (válido por 1 hora)
		const resetToken = this.jwtService.sign(
			{ correo: user.correo, sub: user.id, type: 'password-reset' },
			{ expiresIn: '1h' }
		);

		// TODO: Enviar email con el token de recuperación
		// await this.mailerService.sendPasswordResetEmail(user.correo, resetToken);

		return {
			message:
				'Si el correo existe, recibirás instrucciones para recuperar tu contraseña',
		};
	}

	async resetPassword(resetPasswordDto: ResetPasswordDto) {
		try {
			const decoded = this.jwtService.verify(resetPasswordDto.token);

			if (decoded.type !== 'password-reset') {
				throw new UnauthorizedException('Token inválido');
			}

			const user = await this.usersService.findByCorreo(decoded.correo);

			if (!user) {
				throw new UnauthorizedException('Usuario no encontrado');
			}

			// Hashear la nueva contraseña
			const hashedPassword = await bcrypt.hash(
				resetPasswordDto.nueva_contrasena,
				10
			);

			await user.update({ contrasena: hashedPassword });

			return { message: 'Contraseña actualizada exitosamente' };
		} catch (error) {
			throw new UnauthorizedException('Token inválido o expirado');
		}
	}

	async validateUser(correo: string, contrasena: string) {
		const user = await this.usersService.validatePassword(
			correo,
			contrasena
		);

		if (user) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { contrasena: _, ...result } = user.toJSON();
			return result;
		}

		return null;
	}
}
