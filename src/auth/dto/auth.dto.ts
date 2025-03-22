import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user.dto';

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
