import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { type } from 'os';

export class CorpsGetWorkingDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  gugun: string;

  @IsOptional()
  // @IsNumber()
  score: number;

  @IsOptional()
  hashtag: any;

  @IsOptional()
  @IsString()
  order: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;
}
