import { ApiProperty } from '@nestjs/swagger';

export class WhatsAppResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Message sent successfully',
  })
  message: string;
}
