import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@football.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@football.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'newemail@football.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentpassword' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}
