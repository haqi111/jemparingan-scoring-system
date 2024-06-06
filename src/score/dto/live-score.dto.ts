import { IsInt, IsString } from 'class-validator';

export class LiveScoreDto {
  @IsInt()
  number_participant: number;

  @IsString()
  name: string;

  @IsString()
  club: string;

  @IsInt()
  totalScore: number;
}
