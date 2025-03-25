import { Injectable } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider, ProviderDocument } from './entities/provider.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from '../user/user.service';

@Injectable()
export class ProviderService {

  constructor(
    @InjectModel(Provider.name) private providerModel: Model<ProviderDocument>,
    private userService: UserService
  ) { }

  create(createProviderDto: CreateProviderDto) {
    return this.providerModel.create(createProviderDto);
  }

  findAll() {
    return this.providerModel.find().populate('userId').exec();
  }

  findOne(id: string) {
    return this.providerModel.findById(id).populate('userId').exec();
  }

  update(id: string, updateProviderDto: UpdateProviderDto) {
    return this.providerModel.findByIdAndUpdate(id, updateProviderDto).exec();
  }

  remove(id: string) {
    return this.providerModel.findByIdAndDelete(id).exec();
  }
}
