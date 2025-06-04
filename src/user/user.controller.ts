import {Controller, Delete, Get, Param, Post, Put, Body} from '@nestjs/common';
import { UserService } from './user.service'

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    /**
     * http://localhost:3000/users
     *  
     */

    @Get()
    getAllUsers() {
        return this.userService.getAllUsers();
    }
    
    @Get(':id')
    getUserById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

    @Post()
    createUser(@Body() userData: any) {
        return this.userService.createUser(userData);
    }

    @Put(':id')
    updateUser(@Param('id') id: string, @Body() userData: any) {
        return this.userService.updateUser(id, userData);
    }

    /** 
     * http://localhost:3000/users/
     */
}