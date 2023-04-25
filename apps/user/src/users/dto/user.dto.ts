import { Allow, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../schemas/users.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEmail()
  phoneNumber: string;

  @Allow()
  role: Role;
}
