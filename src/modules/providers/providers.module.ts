import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Provider, ProviderSchema } from './entities/provider.entity'
import { ProvidersController } from './providers.controller'
import { BcryptService } from '../../shared/services/bcrypt.service'
import { ProvidersService } from './providers.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Provider.name, schema: ProviderSchema },
    ]),
    UserModule,
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService, BcryptService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
