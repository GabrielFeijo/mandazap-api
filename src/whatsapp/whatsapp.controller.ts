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
import { WhatsAppService } from './whatsapp.service';
import { User } from '../decorators/user.decorator';
import { CreateInstanceDto, SendMessageDto } from './dto/whatsapp.dto';
import { User as PrismaUser } from '@prisma/client';

@Controller('whatsapp')
@UseGuards(AuthGuard('jwt'))
export class WhatsAppController {
  constructor(private whatsAppService: WhatsAppService) {}

  @Post('instances')
  async createInstance(
    @User() user: PrismaUser,
    @Body() createInstanceDto: CreateInstanceDto,
  ) {
    return this.whatsAppService.createInstance(user.id, createInstanceDto.name);
  }

  @Get('instances')
  async getInstances(@User() user: PrismaUser) {
    return this.whatsAppService.getUserInstances(user.id);
  }

  @Get('instances/:id')
  async getInstance(@User() user: PrismaUser, @Param('id') instanceId: string) {
    return this.whatsAppService.getInstanceById(instanceId, user.id);
  }

  @Post('instances/:id/connect')
  async connectInstance(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
  ) {
    return this.whatsAppService.connectInstance(instanceId, user.id);
  }

  @Post('instances/:id/disconnect')
  async disconnectInstance(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
  ) {
    return this.whatsAppService.disconnectInstance(instanceId, user.id);
  }

  @Get('instances/:id/messages')
  async getMessages(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 999,
  ) {
    return this.whatsAppService.getInstanceMessages(
      instanceId,
      user.id,
      page,
      limit,
    );
  }

  @Post('instances/:id/send-message')
  async sendMessage(
    @User() user: PrismaUser,
    @Param('id') instanceId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.whatsAppService.sendMessage(
      instanceId,
      user.id,
      sendMessageDto.to,
      sendMessageDto.message,
    );
  }

  @Get('instances/:id/contacts')
  async getContacts(@User() user: PrismaUser, @Param('id') instanceId: string) {
    return this.whatsAppService.getInstanceContacts(instanceId, user.id);
  }
}
