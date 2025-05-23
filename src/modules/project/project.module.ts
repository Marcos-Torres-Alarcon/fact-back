import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'
import { Project, ProjectSchema } from './entities/project.entity'
import { ProjectTypeService } from './project-type.service'
import { ProjectTypeController } from './project-type.controller'
import { ProjectType, ProjectTypeSchema } from './entities/project-type.entity'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectType.name, schema: ProjectTypeSchema },
    ]),
    UsersModule,
  ],
  controllers: [ProjectController, ProjectTypeController],
  providers: [ProjectService, ProjectTypeService],
  exports: [ProjectService, ProjectTypeService],
})
export class ProjectModule {}
