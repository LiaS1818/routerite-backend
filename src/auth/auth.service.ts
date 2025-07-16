import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { SignupDto } from './dtos/singup.dto';
import { hash, compare } from 'bcrypt'; // Use bcrypt for password hashing
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User) private userModel: typeof User, private jwtService: JwtService) {}

    async signup(signupData: SignupDto): Promise<User> {
        const { name, email, password } = signupData;
        // Check if the email is in use
        const existingUser = await this.userModel.findOne({
            where: { email: signupData.email },
        })
        if (existingUser) {
            throw new BadRequestException('Email is already in use');
        }
        // TODO: Hash password before saving
        const hashedPassword = await hash(signupData.password, 10);

        // Create the new user
        const newUser = await this.userModel.create({
            name: name,
            email: email,
            password: hashedPassword,
        });
        return newUser;
    }

    async validateUser(loginData: { email: string; password: string }): Promise<{ user: User; token: string }> {
        const { email, password } = loginData;
        // Find the user by email
        const user = await this.userModel.findOne({
            where: { email },
        });
        if (!user) {
            throw new BadRequestException('Invalid email or password');
        }
      

        //TODO: Generate and return JWT token
        const token = this.generateJwtToken(user);
        return { user, token };
    }

    private generateJwtToken(user: User): string {
        const { password, ...findUser } = user; // Exclude password from the token payload
        return this.jwtService.sign(findUser);
    }
}