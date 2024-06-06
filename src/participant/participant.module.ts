import { Module } from '@nestjs/common';
import { ParticipantsService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ParticipantController],
  providers: [ParticipantsService, PrismaService, AuthService, JwtService],
})
export class ParticipantModule {}
