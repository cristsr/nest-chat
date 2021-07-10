import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { UpdateUserDto } from 'modules/user/dto/update-user.dto';
import { CreateUserDto } from 'modules/user/dto/create-user.dto';
import { UserRepository } from 'modules/user/repositories/user/user.repository';
import { CurrentUser } from 'modules/auth/decorators/current-user';
import { UserDto } from 'modules/user/dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserRepository) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: UserDto): UserDto {
    return user;
  }
}
