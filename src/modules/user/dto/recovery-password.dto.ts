import { IsOptional, IsString } from 'class-validator';

export class RecoveryPasswordDto {
  @IsString()
  user: string;

  @IsString()
  dueDate: string;

  @IsString()
  recoveryToken: string;

  @IsOptional()
  isCompleted?: boolean;
}
