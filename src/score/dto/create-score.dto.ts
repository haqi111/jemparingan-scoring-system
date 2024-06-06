import {
  IsInt,
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

class ScoreInput {
  @IsNotEmpty()
  participantId: string;

  @IsInt()
  @IsNotEmpty()
  roundId: number;

  @IsArray()
  @ArrayMaxSize(4)
  @IsIn([1, 3, 0], { each: true })
  @ValidateIf((obj) => obj.scores !== null)
  scores: number[];
}

export class CreateScoresDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreInput)
  scoreInputs: ScoreInput[];
}
