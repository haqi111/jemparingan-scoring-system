import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';
export class CreateAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
