import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';

export interface IUser {
    _id?: Types.ObjectId;
    email: string;
    name: string;
    password?: string;
    type: string; //google //normal
    roleId: Types.ObjectId;
    roles?: string[];
}

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }
    async findOne(email: string): Promise<IUser> {
        const user = await this.userModel.findOne({ email }).populate('roleId').exec();
        if (!user) {
            return null;
        }
        return user.toObject();
    }

    async create(userData: IUser): Promise<IUser> {
        const createdUser = new this.userModel(userData);
        const savedUser = await createdUser.save();
        const populatedUser = await this.userModel.findById(savedUser._id).populate('roleId').exec();
        const { password, ...userWithoutPassword } = populatedUser.toObject();
        return userWithoutPassword;
    }

}
