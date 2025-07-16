import { Controller, Post, Body, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/singup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //TDO: POST signup
  @Post('signup') //auth/signup
  async signUp(@Body() signupData: SignupDto){
    return this.authService.signup(signupData);
  }

  //TODO: POST login
  @Post('login') //auth/login
  async login(@Body() loginData: { email: string; password: string }) {
    const { user, token } = await this.authService.validateUser(loginData);
    return { user, token };
  }
}
