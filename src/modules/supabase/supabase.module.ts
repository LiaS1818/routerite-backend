import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { createClient } from '@supabase/supabase-js';
import { SupabaseStorageService } from './supabase-storage.service';

@Module({
	imports: [HttpModule],
	providers: [
		SupabaseStorageService,
		{
			provide: 'SUPABASE_CLIENT',
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const url = configService.get<string>('SUPABASE_URL');
				const key = configService.get<string>('SUPABASE_KEY');

				if (!url || !key) {
					throw new Error(
						'Missing SUPABASE_URL or SUPABASE_KEY environment variables'
					);
				}

				return createClient(url, key);
			},
		},
	],
	exports: ['SUPABASE_CLIENT', SupabaseStorageService],
})
export class SupabaseModule {}
