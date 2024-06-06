import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'nestjs-prisma';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, AuthService, JwtService],
})
export class AdminModule {}
