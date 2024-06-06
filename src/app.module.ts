import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { ConfigModule } from '@nestjs/config';
import { ScoreModule } from './score/score.module';
import { ParticipantModule } from './participant/participant.module';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot(),
    ScoreModule,
    ParticipantModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
