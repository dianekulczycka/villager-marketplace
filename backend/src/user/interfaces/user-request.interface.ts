import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

export interface UserRequest extends Request {
  user: JwtPayload;
}
