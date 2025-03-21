import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [UsersModule, DrizzleModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
