import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInstanceDto {
  @ApiProperty({
    description: 'Name for the WhatsApp instance',
    example: 'My Business WhatsApp',
    minLength: 1,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
}
