import { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

export interface IUserRequest extends Request {
  user: IJwtPayload;
}
