import { Allow, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Role } from '../schemas/users.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  display_name: string;

  @IsString()
  uid: string;

  @Allow()
  fcm_tokens: string[];

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEmail()
  phone_number: string;

  @Allow()
  role: Role;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
