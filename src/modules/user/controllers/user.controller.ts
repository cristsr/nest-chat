import { Controller, Get, Body, Put, Param, Delete } from '@nestjs/common';
import { UserRepository } from 'modules/user/repositories/user/user.repository';
import { CurrentUser } from 'modules/auth/decorators/current-user';
import { UpdateUserDto, UserDto } from 'modules/user/dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserRepository) {}

  @Get()
  findAll() {
    return this.userService.findAll();
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
