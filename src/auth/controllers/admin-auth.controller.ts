import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AdminRegisterDto } from '../dto/admin-register.dto';

@ApiTags('Admin Authentication')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new admin or merchant' })
  @ApiResponse({ status: 201, description: 'Admin/Merchant successfully registered', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: AdminRegisterDto): Promise<AuthResponseDto> {
    return this.authService.registerAdmin(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin/Merchant login' })
  @ApiResponse({ status: 200, description: 'Admin successfully logged in', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials or insufficient permissions' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.loginAdmin(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh admin access token' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshToken);
  }
}