import { Module } from '@nestjs/common';
import { TracklogsService } from './tracklogs.service';
import { TracklogsController } from './tracklogs.controller';

@Module({
  controllers: [TracklogsController],
  providers: [TracklogsService]
})
export class TracklogsModule {}
