import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TracklogsService } from './tracklogs.service';
import { CreateTracklogDto } from './dto/create-tracklog.dto';
import { UpdateTracklogDto } from './dto/update-tracklog.dto';

@Controller()
export class TracklogsController {
  constructor(private readonly tracklogsService: TracklogsService) {}

  @MessagePattern('createTracklog')
  create(@Payload() createTracklogDto: CreateTracklogDto) {
    return this.tracklogsService.create(createTracklogDto);
  }

  @MessagePattern('findAllTracklogs')
  findAll() {
    return this.tracklogsService.findAll();
  }

  @MessagePattern('findOneTracklog')
  findOne(@Payload() id: number) {
    return this.tracklogsService.findOne(id);
  }

  @MessagePattern('updateTracklog')
  update(@Payload() updateTracklogDto: UpdateTracklogDto) {
    return this.tracklogsService.update(updateTracklogDto.id, updateTracklogDto);
  }

  @MessagePattern('removeTracklog')
  remove(@Payload() id: number) {
    return this.tracklogsService.remove(id);
  }
}
