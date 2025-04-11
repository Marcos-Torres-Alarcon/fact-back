import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProviderService } from './provider.service'
import { ProviderController } from './provider.controller'
import { Provider, ProviderSchema } from './entities/provider.entity'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Provider.name, schema: ProviderSchema },
    ]),
    UserModule
  ],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
