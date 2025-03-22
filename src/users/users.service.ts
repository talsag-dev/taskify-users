import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { DrizzleDb } from '../drizzle/drizzle';
import { hashPassword } from '../utils/index';
import { users } from '../drizzle/schema';
import { UserResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDb) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (existingUser.length > 0) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await hashPassword(dto.password);

    const [created] = await this.db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      })
      .returning();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = created;
    return new UserResponseDto(safeUser);
  }

  async getUserByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user || null; // can stay raw
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return new UserResponseDto(safeUser);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const updateFields: Partial<typeof users.$inferInsert> = {
      name: dto.name,
      email: dto.email,
    };

    if (dto.password) {
      updateFields.password = await hashPassword(dto.password);
    }

    const [updated] = await this.db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = updated;
    return new UserResponseDto(safeUser);
  }

  async deleteUser(id: string): Promise<UserResponseDto> {
    const [deleted] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = deleted;
    return new UserResponseDto(safeUser);
  }
}
