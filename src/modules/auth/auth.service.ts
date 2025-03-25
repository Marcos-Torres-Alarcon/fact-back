import { BadRequestException, Injectable } from '@nestjs/common';
import { IUser, UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { Types } from 'mongoose';
import { RoleService } from '../role/role.service';
@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private roleService: RoleService
    ) { }

    async register(registerDto: RegisterDto): Promise<any> {
        const { email, password, name, type, role } = registerDto;
        const userExists = await this.userService.findOne(email);
        if (userExists) {
            throw new BadRequestException('El usuario ya existe');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const roleObject = await this.roleService.findByName(role);
        await this.userService.create({ email, password: hashedPassword, name, roleId: new Types.ObjectId(roleObject._id), type });
        return {
            message: 'Usuario creado correctamente',
        };
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findOne(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(userData: IUser) {

        let user;
        user = await this.userService.findOne(userData.email);
        if (!user) {
            throw new BadRequestException('El usuario no existe');
        }
        if (userData.type !== 'google') {
            if (user.type === 'google') {
                throw new BadRequestException('Se registró con google, no se puede iniciar sesión con correo y contraseña');
            }
            user = await this.validateUser(userData.email, userData.password);
            if (!user) {
                throw new BadRequestException('Credenciales inválidas');
            }

        }
        const payload = {
            email: user.email,
            userId: user._id.toString(),
            roles: [user.roleId.name]
        };
        return {
            access_token: this.jwtService.sign(payload),
            ...user,
        };
    }
}