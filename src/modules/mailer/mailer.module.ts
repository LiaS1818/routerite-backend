import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import * as path from 'path';

@Module({
	imports: [
		ConfigModule,
		NestMailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => {
				const mailUser = config.get<string>('MAIL_USER');
				const mailPassword = config.get<string>('MAIL_PASSWORD');
				const mailHost = config.get<string>('MAIL_HOST');
				const mailPort = config.get<string>('MAIL_PORT');

				console.log('=== MAIL CONFIG DEBUG ===');
				console.log('MAIL_USER:', mailUser);
				console.log(
					'MAIL_PASSWORD:',
					mailPassword ? '***SET***' : 'NOT SET'
				);
				console.log('MAIL_HOST:', mailHost);
				console.log('MAIL_PORT:', mailPort);
				console.log('========================');

				if (!mailUser || !mailPassword) {
					console.warn(
						'Mail credentials not found. Mail service will not work properly.'
					);
					return {
						transport: {
							host: 'localhost',
							port: 1025,
							ignoreTLS: true,
							secure: false,
						},
						defaults: {
							from: '"No Reply" <noreply@example.com>',
						},
						template: {
							dir: path.join(
								process.cwd(),
								'src',
								'mailer',
								'templates'
							),
							adapter: new HandlebarsAdapter(),
							options: {
								strict: true,
							},
						},
					};
				}

				return {
					transport: {
						host: mailHost || 'smtp.gmail.com',
						port: parseInt(mailPort || '587'),
						secure: false,
						auth: {
							user: mailUser,
							pass: mailPassword,
						},
					},
					defaults: {
						from: `"No Reply" `,
					},
					template: {
						dir: path.join(
							process.cwd(),
							'src',
							'mailer',
							'templates'
						),
						adapter: new HandlebarsAdapter(),
						options: {
							strict: true,
						},
					},
				};
			},
		}),
	],
	providers: [MailerService],
	exports: [MailerService],
})
export class MailerModule {}
