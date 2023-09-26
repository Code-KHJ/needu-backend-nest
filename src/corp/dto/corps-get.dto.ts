import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CorpsGetDto {
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
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;
}
