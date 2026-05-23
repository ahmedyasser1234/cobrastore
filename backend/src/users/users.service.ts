import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { PointsTransaction } from '../entities/points-transaction.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PointsTransaction)
    private pointsTransactionRepository: Repository<PointsTransaction>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Generate unique referral code
    const baseCode = userData.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
    
    let user = this.usersRepository.create({ ...userData, password: hashedPassword, referralCode });
    
    // Check if referred by someone
    let referringUser = null;
    if (userData.referredBy) {
      referringUser = await this.usersRepository.findOne({ where: { referralCode: userData.referredBy } });
      if (referringUser) {
        user.points = 500; // Bonus for signing up with referral
      }
    }

    user = await this.usersRepository.save(user);

    // Award points to referrer
    if (referringUser) {
      referringUser.points += 500;
      await this.usersRepository.save(referringUser);
      
      await this.pointsTransactionRepository.save([
        this.pointsTransactionRepository.create({
          userId: user.id,
          amount: 500,
          reason: 'REFERRAL_SIGNUP',
        }),
        this.pointsTransactionRepository.create({
          userId: referringUser.id,
          amount: 500,
          reason: 'REFERRED_USER',
        })
      ]);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'refreshToken'] 
    });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { id },
      relations: ['vendor']
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    let hashedToken = null;
    if (refreshToken) {
      hashedToken = await bcrypt.hash(refreshToken, 10);
    }
    await this.usersRepository.update(id, { refreshToken: hashedToken });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }
}
