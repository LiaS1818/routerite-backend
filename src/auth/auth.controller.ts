import { Controller, Get, Query, Post, Body, BadRequestException, NotFoundException, HttpStatus, HttpException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/singup.dto';
import { ok } from 'node:assert';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //TDO: POST signup
  @Post('signup') //auth/signup
  async signUp(@Body() signupData: SignupDto){
    return this.authService.signup(signupData);
  }

  // POST signup de prueba sin DTO
  @Post('signup-test') //auth/signup-test
  async signUpTest(@Body() signupData: { name: string; email: string; password: string }) {
    if (!signupData.name || !signupData.email || !signupData.password) {
      // imprimir los datos recibidos
      console.log('Received data:', signupData);
      throw new BadRequestException('Name, email, and password are required');
    }else {
      // Todos los datos correctos, llamar al servicio de autenticación
      console.log('All data is valid. Calling auth service...');
    }
  }

  //TODO: POST login
  @Post('login') //auth/login
  async login(@Body() loginData: { email: string; password: string }) {
    const { user, token } = await this.authService.validateUser(loginData);
    return { user, token };
  }
//
  @Get('verify')//auth/verify?token=someToken
  async verifyEmail(@Query('token') token: string) {
    // Verificar el token y activar la cuenta del usuario
    if (!token) {
      throw new BadRequestException('Token is required for email verification');
    }

    // Activar usuario
    const isValid = await this.authService.verifyEmailToken(token);
    if (!isValid) {
      throw new HttpException('Invalid or expired token', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('forgot-password') // auth/forgot-password
  async forgotPassword(@Body('email') email: string) {
    const user = await this.authService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // TODO: Generate and send password reset token
    await this.authService.sendPasswordResetEmail(user);
    return { message: 'Password reset email sent' };
  }


}
