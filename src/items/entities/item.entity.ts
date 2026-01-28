import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemNameEnum } from '../enums/item-name.enum';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ItemNameEnum })
  name: ItemNameEnum;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  count: number;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ nullable: true })
  iconUrl?: string;

  @ManyToOne(() => User, (user) => user.id)
  seller: User;

  @Column({ default: 0 })
  views: number;

  @Column({ default: false })
  isFlagged: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
