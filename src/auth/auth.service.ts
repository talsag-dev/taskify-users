import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { Inject } from '@nestjs/common';
import { DrizzleDb } from '../drizzle/drizzle';
import { LoginDto } from './dto/login.dto';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { comparePasswords } from '../utils';
import { refreshTokens } from '../drizzle/schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.getUserByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await comparePasswords(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async issueTokens(userId: string) {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await this.db.insert(refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  generateAccessToken(userId: string): string {
    const secret = process.env.JWT_SECRET as string;
    const expiresIn = Number(process.env.JWT_EXPIRES_IN_SECONDS || 900);

    return jwt.sign({ sub: userId }, secret, { expiresIn });
  }

  async refreshToken(token: string) {
    const [existing] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));

    if (!existing || (existing.expiresAt && existing.expiresAt < new Date())) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Optional: rotate refresh token
    await this.db.delete(refreshTokens).where(eq(refreshTokens.token, token));

    return this.issueTokens(existing.userId);
  }

  async logout(refreshToken: string) {
    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));
    return { success: true };
  }
}
