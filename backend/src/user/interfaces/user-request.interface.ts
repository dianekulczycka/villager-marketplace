import { IJwtPayload } from '../../shared/interfaces/jwt-payload.interface';

export interface IUserRequest extends Request {
  user: IJwtPayload;
}
