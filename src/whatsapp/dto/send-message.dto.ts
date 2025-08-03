import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Phone number to send message to (with country code)',
    example: '5511999999999',
    pattern: '^[0-9]+$',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  to: string;

  @ApiProperty({
    description: 'Message content to send',
    example: 'Hello! This is a test message from Manda Zap API.',
    minLength: 1,
  })
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}
