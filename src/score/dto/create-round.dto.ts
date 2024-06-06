import { IsNotEmpty, IsString } from 'class-validator';
export class CreateRoundDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
