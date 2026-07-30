import type {SellerType} from '../enums/SellerType.ts';
import type {UserRole} from '../enums/UserRole.ts';

export interface UserPublicView {
    publicId: string;
    username: string;
    iconUrl: string;
    role: UserRole;
    sellerType: SellerType;
    createdAt: string;
}