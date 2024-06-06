import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, ArrayNotEmpty } from 'class-validator';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(
  OmitType(CreateAdminDto, ['password'] as const),
) {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  targets?: string[];
}
