import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MulterModule } from '@nestjs/platform-express'
import { UsersService } from './services/users.service'
import { UsersController } from './controllers/users.controller'
import { User, UserSchema } from './entities/user.entity'
import {
  CompanyConfig,
  CompanyConfigSchema,
} from './entities/company-config.entity'
import { EmailModule } from '../email/email.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CompanyConfig.name, schema: CompanyConfigSchema },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
    EmailModule,
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
