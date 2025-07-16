import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
//import { SupabaseModule } from './supabase/supabase.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		UsersModule,
		AuthModule,
		// SupabaseModule
		// Another way with regiterAsync: this enables you to use async configuration
		// JwtModule.registerAsync({
			//imports: [ConfigModule],
			//useFactory: async (config) => ({
			//	secret: config.get('jwt.secret'),
			//}),
			//global: true,
			//inject: [ConfigService],
		//}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
