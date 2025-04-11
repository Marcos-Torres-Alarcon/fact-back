import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JobService } from './job.service'
import { JobController } from './job.controller'
import { Job, JobSchema } from './entities/job.entity'

@Module({
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
