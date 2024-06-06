import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  ArrayMaxSize,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateRoundScoreDto {
  @IsInt()
  roundId: number;

  @IsArray()
  @ArrayMaxSize(4)
  @IsIn([1, 3, 0], { each: true })
  @ValidateIf((obj) => obj.scores !== null)
  scores: number[];
}

export class UpdateParticipantDto {
  @IsOptional()
  @IsString()
  nik?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  club?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  target?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRoundScoreDto)
  roundScores?: UpdateRoundScoreDto[];
}
