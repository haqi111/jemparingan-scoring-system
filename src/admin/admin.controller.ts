/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  HttpStatus,
  Req,
  Put,
  HttpException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Public } from 'src/common/decorators';
import { multerConfig } from 'src/config/multer.config';

@Controller({
  path: 'admin',
  version: '1',
})
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/create-admin')
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const createdUser = await this.adminService.createAdmin(createAdminDto);
      return res.status(HttpStatus.CREATED).json({
        status_code: HttpStatus.CREATED,
        message: 'Admin Created Successfully',
        data: createdUser,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Get('/lists-admin')
  async getAllAdmin(@Res() res: Response): Promise<Response> {
    try {
      const admin = await this.adminService.getAllAdmin();
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: admin,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Get('/detail-admin/:id')
  async getAdminById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const admin = await this.adminService.getAdminById(id);
      if (!admin) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Server Error, cannot get data',
        });
      }
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: admin,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Put('/update-admin/:id')
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const updateAdmin = await this.adminService.updateAdmin(
        id,
        updateAdminDto,
      );
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Admin updated successfully',
        data: updateAdmin,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Delete('/delete-admin/:id')
  async deleteUser(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const deleted = await this.adminService.deleteAdmin(id);
      if (deleted) {
        return res.status(HttpStatus.OK).json({
          status_code: HttpStatus.OK,
          message: 'Admin deleted successfully',
        });
      }
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Post('/import/admin')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async importParticipants(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const filePath = file.path;
      await this.adminService.importAdminsFromCsv(filePath);

      return { message: 'Admin imported successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('An error occurred during file processing');
    }
  }

  private handleError(error: any, res: Response): Response {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Server Error, cannot update data';

    if (error instanceof HttpException) {
      statusCode = error.getStatus();
      message = error.getResponse()['message'] || message;
    } else if (error instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = error.message || message;
    }

    console.error(error);

    return res.status(statusCode).json({
      status_code: statusCode,
      message: message,
    });
  }
}
