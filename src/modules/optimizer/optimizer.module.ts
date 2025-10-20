import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OptimizerClientService } from './optimizer-client.service';

@Module({
	imports: [
		HttpModule.register({
			timeout: 90000, // 90 segundos
			maxRedirects: 0,
			headers: {
				'Content-Type': 'application/json'
			}
		}),
		ConfigModule,
	],
	providers: [OptimizerClientService],
	exports: [OptimizerClientService],
})
export class OptimizerModule {}
