import { Module } from '@nestjs/common'
import { ProviderService } from './provider.service'
import { ProviderController } from './provider.controller'
import { Provider, ProviderSchema } from './entities/provider.entity'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Provider.name, schema: ProviderSchema },
    ]),
    UserModule,
  ],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
