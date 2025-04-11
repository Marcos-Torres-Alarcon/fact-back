import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'
import { Project, ProjectSchema } from './entities/project.entity'
import { ClientModule } from '../client/client.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    ClientModule,
    UserModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
