import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Query,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { AuthService } from 'modules/auth/services/auth.service';
import { Public } from 'modules/auth/decorators/public';
import { CurrentUser } from 'modules/auth/decorators/current-user';
import { CreateUserDto, UserDto } from 'modules/user/dto/user.dto';
import { LoginDto } from 'modules/auth/dto/login.dto';
import { uid } from 'uid/secure';
import {
  ForgotPasswordDto,
  RecoveryPasswordDto,
  ResetPasswordDto,
} from 'modules/auth/dto/recovery-password.dto';
import { RefreshJwtGuard } from 'modules/auth/guards/refresh-jwt.guard';
import { ResetPasswordGuard } from 'modules/auth/guards/reset-password.guard';
import { AuthInfo } from 'modules/auth/decorators/auth-info';
import { LocalGuard } from 'modules/auth/guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalGuard)
  @Post('login')
  login(@CurrentUser() user: UserDto): LoginDto {
    return this.authService.generateJwt(user);
  }

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @UseGuards(ResetPasswordGuard)
  @Post('reset-password')
  async resetPassword(
    @AuthInfo() data: RecoveryPasswordDto,
    @Body() { password }: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(data, password);
  }

  @Public()
  @UseGuards(RefreshJwtGuard)
  @Get('refresh')
  refreshToken(@CurrentUser() user: UserDto) {
    return this.authService.generateJwt(user, true);
  }

  @Public()
  @Get('uid')
  uidGen(@Query('length', ParseIntPipe) length: number) {
    if (length) {
      return uid(+length);
    }

    return uid(64);
  }
}
