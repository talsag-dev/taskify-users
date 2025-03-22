import { ApiProperty } from '@nestjs/swagger';
import { users } from '../../drizzle/schema';
import { InferSelectModel } from 'drizzle-orm';

type UserEntity = InferSelectModel<typeof users>;

export class UserResponseDto implements Omit<UserEntity, 'password'> {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: String, nullable: true })
  name: string | null;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  created_at: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updated_at: Date | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
