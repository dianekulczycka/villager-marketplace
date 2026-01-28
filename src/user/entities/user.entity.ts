import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { UserRoleEnum } from '../enums/user-role.enum';
import { SellerTypeEnum } from '../enums/seller-type.enum';
import { Token } from '../../auth/entities/token.entity';
import { Item } from '../../items/entities/item.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  username: string;

  @Column({ default: UserRoleEnum.BUYER })
  role: UserRoleEnum;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'enum', enum: SellerTypeEnum, nullable: true })
  sellerType: SellerTypeEnum;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ default: false })
  isFlagged: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Item, (item) => item.seller)
  items: Item[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
