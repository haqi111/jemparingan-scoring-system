/* eslint-disable prettier/prettier */
import { Body, Controller, HttpCode, HttpStatus, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, UpdatePasswordDto } from './dto';
import { Tokens } from './types';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { RtGuard } from 'src/common/guards';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { Public } from 'src/common/decorators';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  async login(@Body() authdto: AuthDto, @Res() res: any): Promise<Tokens> {
    try {
      const tokens = await this.authService.login(authdto);
      res.header('Authorization', `Bearer ${tokens.access_token}`);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Login successful', tokens});
    } catch (error) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid credentials' });
    }
  }

  @Post('/logout')
  async logout(@GetCurrentUserId() id: string): Promise<{ message: string }> {
    const result = await this.authService.logout(id);
    if (result) {
      return { message: 'Logout successfully' };
    } else {
      throw new Error('Failed to logout');
    }
  }

  @Put('/change-password')
  async changePassword(
    @Req() req: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res() res: any
  ) {
    try {
      const { oldPassword, newPassword } = updatePasswordDto;
      await this.authService.changePassword(req, oldPassword, newPassword);
      return res.status(HttpStatus.OK).json({ message: 'Password changed successfully'});
    } catch (error) {
      return { error: error.message };
    }
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@GetCurrentUserId() userId: string, @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
  
}
