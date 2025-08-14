import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MailerService {
	constructor(private readonly mailer: NestMailerService) {}

	async sendEmailVerification(to: string, token: string): Promise<void> {
		const verifyUrl = `http://localhost:3000/api/auth/verify?token=${token}`;
		const templatePath = path.join(
			process.cwd(),
			'src',
			'mailer',
			'templates',
			'email-verification.hbs'
		);

		try {
			console.log('Enviando email de verificación a:', to);
			console.log(
				'Template dir:',
				path.join(process.cwd(), 'src', 'mailer', 'templates')
			);
			console.log('Template file exists:', fs.existsSync(templatePath));

			const result = await this.mailer.sendMail({
				to: to,
				subject: 'Email Verification',
				template: 'email-verification',
				context: {
					verifyUrl: verifyUrl,
				},
			});

			console.log('Email enviado exitosamente:', result);
		} catch (error) {
			console.error('Error enviando email de verificación:', error);
			throw error;
		}
	}

	async sendWelcomeEmail(to: string, name: string): Promise<void> {
		try {
			console.log('Enviando email de bienvenida a:', to);

			const result = await this.mailer.sendMail({
				to: to,
				subject: 'Bienvenido a RouteRite',
				template: 'welcome',
				context: {
					name: name,
					email: to,
				},
			});

			console.log('Email de bienvenida enviado exitosamente:', result);
		} catch (error) {
			console.error('Error enviando email de bienvenida:', error);
			throw error;
		}
	}

	async sendPasswordResetEmail(to: string, token: string): Promise<void> {
		const resetUrl = `http://localhost:3000/api/auth/reset-password?token=${token}`;
		const templatePath = path.join(
			process.cwd(),
			'src',
			'mailer',
			'templates',
			'password-reset.hbs'
		);

		try {
			console.log(
				'Enviando email de restablecimiento de contraseña a:',
				to
			);
			console.log(
				'Template dir:',
				path.join(process.cwd(), 'src', 'mailer', 'templates')
			);
			console.log('Template file exists:', fs.existsSync(templatePath));

			const result = await this.mailer.sendMail({
				to: to,
				subject: 'Restablecimiento de Contraseña',
				template: 'password-reset',
				context: {
					resetUrl: resetUrl,
				},
			});

			console.log(
				'Email de restablecimiento enviado exitosamente:',
				result
			);
		} catch (error) {
			console.error(
				'Error enviando email de restablecimiento de contraseña:',
				error
			);
			throw error;
		}
	}
}
