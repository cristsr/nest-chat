import { IsEmail, IsNumber, IsString } from 'class-validator';

export class RecoveryPasswordDto {
  @IsString()
  user: string;

  @IsNumber()
  exp?: number;

  @IsNumber()
  iat?: number;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  password: string;
}
