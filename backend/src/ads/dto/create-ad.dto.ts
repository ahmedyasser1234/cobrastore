import { IsString, IsUrl, IsEnum, IsOptional } from 'class-validator';
import { AdStatus } from '../../entities/ad.entity';

export class CreateAdDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  targetUrl?: string;

  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;
}
