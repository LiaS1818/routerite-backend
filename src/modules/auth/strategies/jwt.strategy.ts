import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private usersService: UsersService
	) {
		console.log('JWT_SECRET:', configService.get('JWT_SECRET'));
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET') || 'secret-key',
		});
	}

	async validate(payload: any) {
		const user = await this.usersService.findOne(payload.id);

		if (!user || !user.active) {
			return null;
		}

		return {
			id: user.id,
			email: user.email,
			name: user.name,
			verificado: user.verified,
		};
	}
}
