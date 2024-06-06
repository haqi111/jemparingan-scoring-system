/* eslint-disable prettier/prettier */
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
import { ParticipantsService } from './participant.service';
import { CreateParticipantDto, UpdateParticipantDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { GetCurrentUserEmail } from 'src/common/decorators/get-current-user-email.decorator';



@Controller({
  path: 'participant',
  version: '1',
})
export class ParticipantController {
  constructor(private readonly participantsService: ParticipantsService) {}

  
  @Post('/create-participant')
  async createParticipant(
    @Body() createParticipantDto: CreateParticipantDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const createParticipant = await this.participantsService.createParticipant(createParticipantDto);
      return res.status(HttpStatus.CREATED).json({
        status_code: HttpStatus.CREATED,
        message: 'Participant Created Successfully',
        data: createParticipant,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Get('/lists-participant')
  async getAllParticipant(@Res() res: Response): Promise<Response> {
    try {
      const participant = await this.participantsService.getAllParticipant();
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: participant,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Get('/lists-uniqueParticipant')
  async getAllParticipantUnique(@GetCurrentUserEmail() email: string, @Res() res: Response): Promise<Response> {
    try {
      const participant = await this.participantsService.getParticipantsByAdminTarget(email);
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: participant,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  
  @Get('/detail-participant/:id')
  async getParticipantById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const participant = await this.participantsService.getParticipantById(id);
      if (!participant) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Server Error, cannot get data',
        });
      }
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: participant,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Put('/update-participant/:id')
  async updateParticipant(
    @GetCurrentUserEmail() email: string,
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const updateParticipant = await this.participantsService.updateParticipant( email, id, updateParticipantDto,);
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Participant updated successfully',
        data: updateParticipant,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  
  @Delete('/delete-participant/:id')
  async deleteParticipant(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const deleted = await this.participantsService.deleteParticipant(id);
      if (deleted) {
        return res.status(HttpStatus.OK).json({
          status_code: HttpStatus.OK,
          message: 'Participant deleted successfully',
        });
      }
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Post('/import/participant')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async importParticipants(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const filePath = file.path;
      await this.participantsService.importParticipantsFromCsv(filePath);

      return { message: 'Participants imported successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('An error occurred during file processing');
    }
  }

  @Get('export')
    async exportParticipants(@Res() res: Response) {
        const filePath = 'participants1.csv';
        await this.participantsService.exportParticipantsToCSV(filePath);
        res.download(filePath, 'participants1.csv', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error exporting participants');
            }
        });
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
