import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { User } from '../decorators/user.decorator';
import { User as PrismaUser } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@User() user: PrismaUser) {
    return this.usersService.findById(user.id);
  }
}
