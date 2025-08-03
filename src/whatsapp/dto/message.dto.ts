import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    description: 'Unique message ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'WhatsApp message ID',
    example: '3EB0C767D095B5C2',
  })
  messageId: string;

  @ApiProperty({
    description: 'Whether the message was sent by the user',
    example: true,
  })
  fromMe: boolean;

  @ApiPropertyOptional({
    description: 'Message text content',
    example: 'Hello! How are you?',
  })
  text?: string | null;

  @ApiProperty({
    description: 'Message type',
    example: 'text',
    enum: [
      'text',
      'image',
      'video',
      'audio',
      'document',
      'location',
      'contact',
    ],
  })
  type: string;

  @ApiProperty({
    description: 'Message timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Message status',
    example: 'read',
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
  })
  status?: string | null;

  @ApiProperty({
    description: 'Contact ID who sent/received this message',
    example: '507f1f77bcf86cd799439011',
  })
  contactId: string;

  @ApiProperty({
    description: 'Instance ID this message belongs to',
    example: '507f1f77bcf86cd799439011',
  })
  instanceId: string;

  @ApiPropertyOptional({
    description: 'Associated media ID (if message has media)',
    example: '507f1f77bcf86cd799439011',
  })
  mediaId?: string | null;

  @ApiProperty({
    description: 'Message creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
