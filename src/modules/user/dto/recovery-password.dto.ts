import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecoveryPasswordDto {
  @IsString()
  user: string;

  @IsNumber()
  expTime: number;

  @IsNumber()
  issuedAt: number;

  @IsOptional()
  isCompleted?: boolean;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  password: string;
}
