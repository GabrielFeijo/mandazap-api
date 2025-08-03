import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { User } from '../decorators/user.decorator';
import { User as PrismaUser } from '@prisma/client';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { ContactDto } from './dto/contact.dto';
import { MessageDto } from './dto/message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { WhatsAppInstanceDto } from './dto/whatsapp.dto';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { WhatsAppResponseDto } from './dto/whatsapp-response.dto';

@ApiTags('whatsapp')
@ApiBearerAuth('JWT-auth')
@Controller('whatsapp')
@UseGuards(AuthGuard('jwt'))
export class WhatsAppController {
  constructor(private whatsAppService: WhatsAppService) {}

  @Post('instances')
  @ApiOperation({
    summary: 'Create WhatsApp instance',
    description: 'Create a new WhatsApp instance for the authenticated user',
  })
  @ApiBody({
    type: CreateInstanceDto,
    description: 'Instance creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Instance created successfully',
    type: WhatsAppInstanceDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async createInstance(
    @User() user: PrismaUser,
    @Body() createInstanceDto: CreateInstanceDto,
  ): Promise<WhatsAppInstanceDto> {
    return this.whatsAppService.createInstance(user.id, createInstanceDto.name);
  }

  @Get('instances')
  @ApiOperation({
    summary: 'Get user instances',
    description: 'Retrieve all WhatsApp instances for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Instances retrieved successfully',
    type: [WhatsAppInstanceDto],
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getInstances(@User() user: PrismaUser): Promise<WhatsAppInstanceDto[]> {
    return this.whatsAppService.getUserInstances(user.id);
  }

  @Get('instances/:id')
  @ApiOperation({
    summary: 'Get instance by ID',
    description: 'Retrieve a specific WhatsApp instance by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Instance retrieved successfully',
    type: WhatsAppInstanceDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid instance ID',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Instance not found',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getInstance(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
  ): Promise<WhatsAppInstanceDto> {
    return this.whatsAppService.getInstanceById(instanceId, user.id);
  }

  @Post('instances/:id/connect')
  @ApiOperation({
    summary: 'Connect WhatsApp instance',
    description: 'Initiate connection to WhatsApp for the specified instance',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Connection initiated successfully',
    type: WhatsAppResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid instance ID',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Instance not found',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async connectInstance(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
  ): Promise<WhatsAppResponseDto> {
    return this.whatsAppService.connectInstance(instanceId, user.id);
  }

  @Post('instances/:id/disconnect')
  @ApiOperation({
    summary: 'Disconnect WhatsApp instance',
    description: 'Disconnect the specified WhatsApp instance',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Instance disconnected successfully',
    type: WhatsAppResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid instance ID',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Instance not found',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async disconnectInstance(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
  ): Promise<WhatsAppResponseDto> {
    return this.whatsAppService.disconnectInstance(instanceId, user.id);
  }

  @Get('instances/:id/messages')
  @ApiOperation({
    summary: 'Get instance messages',
    description:
      'Retrieve messages for a specific WhatsApp instance with pagination',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number (starts from 1)',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 20,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [MessageDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid parameters',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Instance not found',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getMessages(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 999,
  ): Promise<MessageDto[]> {
    return this.whatsAppService.getInstanceMessages(
      instanceId,
      user.id,
      page,
      limit,
    );
  }

  @Post('instances/:id/send-message')
  @ApiOperation({
    summary: 'Send WhatsApp message',
    description: 'Send a text message through the specified WhatsApp instance',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: SendMessageDto,
    description: 'Message data',
  })
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully',
    type: WhatsAppResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or instance not connected',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Instance not found',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async sendMessage(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<WhatsAppResponseDto> {
    return this.whatsAppService.sendMessage(
      instanceId,
      user.id,
      sendMessageDto.to,
      sendMessageDto.message,
    );
  }

  @Get('instances/:id/contacts')
  @ApiOperation({
    summary: 'Get instance contacts',
    description: 'Retrieve all contacts for a specific WhatsApp instance',
  })
  @ApiParam({
    name: 'id',
    description: 'Instance ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacts retrieved successfully',
    type: [ContactDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid instance ID',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Instance not found',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getContacts(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
  ): Promise<ContactDto[]> {
    return this.whatsAppService.getInstanceContacts(instanceId, user.id);
  }
}
