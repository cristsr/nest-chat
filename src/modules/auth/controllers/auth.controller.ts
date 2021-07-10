import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'modules/auth/services/auth.service';
import { Public } from 'modules/auth/decorators/public';
import { CreateUserDto } from 'modules/user/dto/create-user.dto';
import { ForgotPasswordDto } from 'modules/user/dto/forgot-password.dto';
import { CurrentUser } from 'modules/auth/decorators/current-user';
import { UserDto } from 'modules/user/dto/user.dto';
import { LoginResponseDto } from 'modules/auth/dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@CurrentUser() user: UserDto): LoginResponseDto {
    return this.authService.generateJwt(user);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('change-password')
  async recoveryPassword(@Body() { recoveryToken, password }) {
    return this.authService.changePassword(recoveryToken, password);
  }

  @Get('refresh')
  refreshToken(@Request() request) {
    return this.authService.refresh(request.user);
  }
}
