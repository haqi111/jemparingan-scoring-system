import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
export class CreateParticipantDto {
  @IsNotEmpty()
  nik: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  number_participant: number;

  @IsString()
  @IsOptional()
  club: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  targetName: string;
}
