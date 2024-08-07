import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { type } from 'os';

export class CorpsGetWorkingDto {
  @IsOptional()
  @IsString()
  corp_name: string;

  @IsOptional()
  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  score: string;

  @IsOptional()
  @IsString()
  hashtags: string;

  @IsOptional()
  @IsString()
  order: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;
}
