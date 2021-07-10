export class RecoveryPasswordDto {
  user: string;
  dueDate: string;
  recoveryToken: string;
  isCompleted?: boolean;
}
