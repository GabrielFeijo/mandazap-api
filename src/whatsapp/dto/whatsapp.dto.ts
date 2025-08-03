import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WhatsAppInstanceDto {
  @ApiProperty({
    description: 'Unique instance ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Instance name',
    example: 'My Business WhatsApp',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Associated phone number',
    example: '5511999999999',
  })
  phoneNumber?: string | null;

  @ApiProperty({
    description: 'Instance connection status',
    example: 'connected',
    enum: ['disconnected', 'connecting', 'connected', 'error'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'QR code for connection (base64 encoded)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrCode?: string | null;

  @ApiProperty({
    description: 'User ID who owns this instance',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Instance creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Instance last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
