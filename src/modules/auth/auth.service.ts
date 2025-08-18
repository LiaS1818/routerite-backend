import {
	Injectable,
	UnauthorizedException,
	ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto, LoginDto } from './dto/singup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/resert-password.dto';
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

			const payload = { email: user.email, sub: user.id };
			const access_token = this.jwtService.sign(payload);

			return {
				access_token,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					verified: user.verified,
				},
			};
		} catch (error) {
			if (error instanceof ConflictException) {
				throw error;
			}
			throw new Error('Error creating account');
		}
	}

	async login(loginDto: LoginDto) {
		const user = await this.usersService.validatePassword(
			loginDto.email,
			loginDto.password
		);

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		if (!user.active) {
			throw new UnauthorizedException('Account disabled');
		}

		const payload = {  id: user.id };
		const access_token = this.jwtService.sign(payload);

		return {
			access_token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				verified: user.verified,
			},
		};
	}

	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const user = await this.usersService.findByEmail(
			forgotPasswordDto.email
		);

		if (!user) {
			// For security, we don't reveal if the email exists or not
			return {
				message:
					'If the email exists, you will receive instructions to recover your password',
			};
		}

		// Generate recovery token (valid for 1 hour)
		const resetToken = this.jwtService.sign(
			{ email: user.email, sub: user.id, type: 'password-reset' },
			{ expiresIn: '1h' }
		);

		// TODO: Send email with recovery token
		// await this.mailerService.sendPasswordResetEmail(user.email, resetToken);

		return {
			message:
				'If the email exists, you will receive instructions to recover your password',
		};
	}

	async resetPassword(resetPasswordDto: ResetPasswordDto) {
		try {
			// Verify token
			const payload = this.jwtService.verify(resetPasswordDto.token);

			// Check if it's a password reset token
			if (payload.type !== 'password-reset') {
				throw new UnauthorizedException('Invalid token');
			}

			// Find user
			const user = await this.usersService.findByEmail(payload.email);

			if (!user) {
				throw new UnauthorizedException('Invalid token');
			}

			// Hash new password
			const hashedPassword = await bcrypt.hash(resetPasswordDto.new_password, 10);

			// Update password
			await this.usersService.update(user.id, {
				password: hashedPassword,
			});

			return {
				message: 'Password updated successfully',
			};
		} catch (error) {
			if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
				throw new UnauthorizedException('Invalid or expired token');
			}
			throw error;
		}
	}
}
