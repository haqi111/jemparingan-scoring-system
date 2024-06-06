import { Module } from '@nestjs/common';
import { ScoreService } from './score.service';
import { ScoresController } from './score.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ScoresController],
  providers: [ScoreService, PrismaService, AuthService, JwtService],
})
export class ScoreModule {}
