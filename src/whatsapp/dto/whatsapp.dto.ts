import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInstanceDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SendMediaDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
