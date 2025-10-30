import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
	) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();

		try {
			// Try normal authentication first
			const result = await super.canActivate(context);
			return result as boolean;
		} catch (error) {
			// If authentication failed, check if it's due to token expiration
			const token = this.extractTokenFromHeader(request);

			if (!token) {
				throw new UnauthorizedException('No token provided');
			}

			try {
				// Verify token ignoring expiration
				const payload = this.jwtService.verify(token, {
					secret: this.configService.get('JWT_SECRET') || 'secret-key',
					ignoreExpiration: true,
				});

				// Check if the original error was due to expiration
				try {
					this.jwtService.verify(token, {
						secret: this.configService.get('JWT_SECRET') || 'secret-key',
						ignoreExpiration: false,
					});
					// If we get here, the token is valid and not expired
					// So the original error was for another reason
					throw error;
				} catch (verifyError) {
					console.log("Error verifying token: ", verifyError)
					// Check if it's specifically a token expiration error
					if (verifyError.name !== 'TokenExpiredError') {
						throw error;
					}
				}

				// Token is valid but expired - refresh it
				// Generate new token using the same payload
				const newPayload = { id: payload.id };
				const newToken = this.jwtService.sign(newPayload, {
					secret: this.configService.get('JWT_SECRET') || 'secret-key',
				});

				// Add refreshed token to response header
				response.setHeader('x-refreshed-token', newToken);

				// Attach user to request (will be validated by JwtStrategy on next request)
				// For this request, we trust the expired token's payload
				request.user = {
					id: payload.id,
					email: payload.email,
					name: payload.name,
					verificado: payload.verificado,
				};

				return true;
			} catch (refreshError) {
				// If refresh failed, throw the original error
				console.log("Error refreshing token: ", refreshError)
				throw error;
			}
		}
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const authHeader = request.headers.authorization;
		if (!authHeader) {
			return undefined;
		}

		const [type, token] = authHeader.split(' ');
		return type === 'Bearer' ? token : undefined;
	}
}
