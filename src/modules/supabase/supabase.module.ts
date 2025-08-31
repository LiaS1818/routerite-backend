import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Module({
	providers: [
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
	exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
