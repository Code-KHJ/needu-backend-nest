import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CorpsGetTrainingDto {
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
  number_of_participants: string;

  @IsOptional()
  @IsString()
  cost: string;

  @IsOptional()
  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  order: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;
}
