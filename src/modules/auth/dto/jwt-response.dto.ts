export class JwtResponseDto {
  public accessToken: string;
  public tokenType: string;
  public expiresIn: number;
  public refreshToken?: string;
}
