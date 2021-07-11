import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'modules/auth/services/auth.service';
import { Public } from 'modules/auth/decorators/public';
import { CurrentUser } from 'modules/auth/decorators/current-user';
import { CreateUserDto, LoginUserDto } from 'modules/user/dto/user.dto';
import { LoginResponseDto } from 'modules/auth/dto/login-response.dto';
import { uid } from 'uid/secure';
import { ForgotPasswordDto } from 'modules/user/dto/recovery-password.dto';

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
  login(@CurrentUser() user: LoginUserDto): LoginResponseDto {
    return this.authService.generateJwt(user);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Get('validate-recovery-token')
  async validateRecoveryToken(@Query('token') token: string) {
    return this.authService.validateRecoveryToken(token);
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

  @Public()
  @Get('uid')
  uidGen(@Query('length') length) {
    if (length) {
      return uid(+length);
    }

    return uid(64);
  }
}
