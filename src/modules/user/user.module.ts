import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './entities/user.entity'
import { RoleModule } from '../role/role.module'
import { EmailModule } from '../email/email.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RoleModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
