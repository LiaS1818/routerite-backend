import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { SignupDto } from './dtos/singup.dto';
import { hash, compare } from 'bcrypt'; // Use bcrypt for password hashing
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { MailerService } from 'src/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
        constructor(
        @InjectModel(User) 
        private userModel: typeof User, 
        private jwtService: JwtService,
        private readonly mailer: MailerService,
        private readonly config: ConfigService
    ){}

    async sendVerificationEmail(email: string, name: string): Promise<void> {
        const token = this.jwtService.sign({ email }, { expiresIn: '1h' }); 
        await this.mailer.sendEmailVerification(email, token);

    }

    async signup(signupData: SignupDto): Promise<User> {
        const { name, email, password } = signupData;
        // Check if the email is in use
        const existingUser = await this.userModel.findOne({
            where: { email: email },
        })
        if (existingUser) {
            throw new BadRequestException('Email is already in use');
        }
        // TODO: Hash password before saving
        const hashedPassword = await hash(password, 10);

        // Create the new user
        const newUser = await this.userModel.create({
            name: name,
            email: email,
            password: hashedPassword,

        });

        // Send verification email
        await this.sendVerificationEmail(newUser.email, newUser.name);
        return newUser;
    }

    async validateUser(loginData: { email: string; password: string }): Promise<{ user: User; token: string }> {
        const { email, password } = loginData;
        // Find the user by email and password
        const user = await this.userModel.findOne({
            where: { email }
        });

        if (!user || !(await compare(password, user.password))) {
            throw new BadRequestException('Invalid email or password');
        }

        //TODO: Generate and return JWT token
        const token = this.generateJwtToken(user);
        return { user, token };
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ where: { email } });
    }

    async sendPasswordResetEmail(user: User): Promise<void> {
        const token = this.jwtService.sign({ email: user.email }, { expiresIn: '1h' });
        await this.mailer.sendPasswordResetEmail(user.email, token);
    }

    private generateJwtToken(user: User): string {
        const { password, ...findUser } = user; // Exclude password from the token payload
        return this.jwtService.sign(findUser);
    }

    // Verify email token and activate user account
    async verifyEmailToken(token: string): Promise<boolean> {
        try {
            const decoded = this.jwtService.verify(token);
            const user = await this.userModel.findOne({ where: { email: decoded.email } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            // Activate user account
            user.isEmailVerified = true; // Assuming you have an isActive field in your User model
            await user.save();
            return true;
        } catch (error) {
            console.error('Error verifying email token:', error);
            return false;
        }
    }
}