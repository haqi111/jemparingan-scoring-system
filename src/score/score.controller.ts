/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, ParseIntPipe, Res, HttpStatus, HttpException, Query } from '@nestjs/common';
import { ScoreService } from './score.service';
import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe for validation
import { CreateScoresDto } from './dto/create-score.dto';
import { Public } from 'src/common/decorators';
import { RoundDetailsDto } from './dto/round-details.dto';
import { Response } from 'express';
import { CreateRoundDto } from './dto/create-round.dto';
import { GetCurrentUserEmail } from 'src/common/decorators/get-current-user-email.decorator';

@Controller({
  path: 'scores',
  version: '1',
})
export class ScoresController {
  constructor(private readonly scoreService: ScoreService) {}

  
  @Post('/add-score')
  async addScores(@GetCurrentUserEmail() email: string, @Res() res: Response, @Body(new ValidationPipe()) createScoresDto: CreateScoresDto) {
    try {
      const { scoreInputs } = createScoresDto;
      for (const scoreInput of scoreInputs) {
        const { participantId, roundId, scores } = scoreInput;
        await this.scoreService.addScore(email,participantId, roundId, scores);
      }
      return res.status(HttpStatus.CREATED).json({
        status_code: HttpStatus.CREATED,
        message: 'Scores updated successfully'
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }
  
  @Public()
  @Get('/live-score')
  async getLiveScores(@Res() res: Response): Promise<Response> {
    try {
      const scores = await this.scoreService.getLiveScoreCombined();
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: scores,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Public()
  @Get('/all-score')
  async getAllScores(@Res() res: Response): Promise<Response> {
    try {
      const scores = await this.scoreService.getLiveScoreAll();
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: scores,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Post('/create-round')
  async addRound(@Res() res: Response, @Body(new ValidationPipe()) createRoundDto: CreateRoundDto) {
    try {
      const round =  await this.scoreService.createRound(createRoundDto);
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Scores updated successfully',
        data: round,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  
  @Get('/lists-round')
  async getAllRound(@Res() res: Response): Promise<Response> {
    try {
      const rounds = await this.scoreService.getAllRound();
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: rounds,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  @Get('/detail-round/:id')
  async getRoundDetails(@GetCurrentUserEmail() email: string, @Res() res: Response, @Param('id', ParseIntPipe) roundId: number): Promise<Response> {
    try {
      const details: RoundDetailsDto = await this.scoreService.getRoundDetails(email,roundId);
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: details,
      });
    } catch (error) {
      return this.handleError(error, res);
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

  @Get('export-scores')
    async exportScores(@Query('gender') gender: string, @Res() res: Response) {
        const filePath = 'participants_scores_fix_perempuan.csv';
        await this.scoreService.exportAllScoresToCSV(gender, filePath);
        res.download(filePath, 'participants_scores_fix_perempuan.csv', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error exporting participants scores');
            }
        });
    }
}
