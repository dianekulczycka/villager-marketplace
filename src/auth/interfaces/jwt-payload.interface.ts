export interface IJwtPayload {
  userId: number;
  email: string;
  jti: string;
  iat?: number;
  exp?: number;
}
