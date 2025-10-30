import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../database/models/user.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		SequelizeModule.forFeature([User]),
		forwardRef(() => AuthModule),
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService], // Exportar UsersService para que otros módulos puedan usarlo
})
export class UsersModule {}
