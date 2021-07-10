export class JwtResponseDto {
  public accessToken: string;
  public tokenType: string;
  public expiresIn?: string;
  public refreshToken?: string;
}
