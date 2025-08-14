import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotenv.config();

@Injectable()
export class ApiKeyGuard implements CanActivate {
	/**
	 * This method checks if the request contains a valid API key.
	 * The API key can be provided in the headers or as a query parameter.
	 * @param context - The execution context of the request
	 * @returns boolean - true if the API key is valid, false otherwise
	 */
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const apiKey = request.headers['x-api-key'] || request.query.apiKey;

		if (!apiKey) {
			return false; // No API key provided
		}

		const validApiKey = process.env.API_KEY;
		return apiKey === validApiKey; // Check if the provided API key matches the valid one
	}

	handleRequest(err: any, user: any, info: any): any {
		if (err || !user) {
			throw err || new UnauthorizedException('Unauthorized');
		}
		return user;
	}
}
