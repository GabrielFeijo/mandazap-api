import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactDto {
  @ApiProperty({
    description: 'Unique contact ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'WhatsApp JID (Jabber ID)',
    example: '5511999999999@s.whatsapp.net',
  })
  jid: string;

  @ApiPropertyOptional({
    description: 'Contact display name',
    example: 'John Doe',
  })
  name?: string | null;

  @ApiProperty({
    description: 'Contact phone number',
    example: '5511999999999',
  })
  number: string;

  @ApiPropertyOptional({
    description: 'Contact profile picture URL',
    example: 'https://pps.whatsapp.net/v/t61.24694-24/...',
  })
  profilePic?: string | null;

  @ApiProperty({
    description: 'Instance ID this contact belongs to',
    example: '507f1f77bcf86cd799439011',
  })
  instanceId: string;

  @ApiProperty({
    description: 'Contact creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Contact last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
