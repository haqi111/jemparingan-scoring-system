/* eslint-disable prettier/prettier */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { AuthDto } from './dto';
import { JwtPayload, Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async login(dto: AuthDto): Promise<Tokens> {
    const admin = await this.prisma.admin.findFirst({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new ForbiddenException('Access Denied');
    }

    const passwordMatches = await bcrypt.compare(dto.password, admin.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(admin.id);
    await this.updateRtHash(admin.id, tokens.refresh_token);
    return tokens;
  }

  async logout(id: string): Promise<boolean> {
    await this.prisma.admin.updateMany({
      where: {
        id: id,
        hashRt: {
          not: null,
        },
      },
      data: {
        hashRt: null,
      },
    });
    return true;
  }

  async getTokens(id: string): Promise<Tokens> {
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: id,
      },
    });

    if (!admin) {
      throw new NotFoundException('User not found');
    }
    const jwtPayload: JwtPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async refreshTokens(id: string, rt: string): Promise<Tokens> {
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: id,
      },
    });
    if (!admin || !admin.hashRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, admin.hashRt);
    if (!rtMatches) throw new ForbiddenException('Access Ditolak');

    const tokens = await this.getTokens(admin.id);
    await this.updateRtHash(admin.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(id: string, rt: string): Promise<void> {
    try {
      const hash = await bcrypt.hash(rt, 10);
      await this.prisma.admin.update({
        where: {
          id: id,
        },
        data: {
          hashRt: hash,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update RT hash: ${error.message}`);
    }
  }

  async changePassword( @Req() req: Request, oldPassword: string, newPassword: string,) {
    const headers = req.headers as unknown as IncomingHttpHeaders;
    if (!headers || !headers.authorization) {
      throw new Error('Authorization header is missing');
    }
    const token = headers.authorization.split(' ')[1];
    const id = await this.extractUserIdFromToken(token);

    await this.verifyPassword(oldPassword, id);

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const result = await this.prisma.admin.update({
      where: { id: id },
      data: { password: hashedNewPassword },
    });
    return result;
  }

  async verifyPassword( oldPassword: string, id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: id },
    });
    if (!admin) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }
  }

  async extractUserIdFromToken(token: string): Promise<string> {
    const decoded: any = this.jwtService.decode(token);
    if (!decoded || !decoded.id) {
      throw new Error('Invalid JWT token or missing user ID');
    }
    return decoded.id;
  }

}
