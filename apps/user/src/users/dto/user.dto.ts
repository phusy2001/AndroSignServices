import { Allow, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Role } from '../schemas/users.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  uid: string;

  @Allow()
  fcmTokens: string[];

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEmail()
  phoneNumber: string;

  @Allow()
  role: Role;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
