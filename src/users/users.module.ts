import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../database/models/user.model';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  // imports: [SequelizeModule.forFeature([User]), SupabaseModule],
  imports: [SupabaseModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule { }
