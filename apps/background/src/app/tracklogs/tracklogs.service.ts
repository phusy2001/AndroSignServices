import { Injectable } from '@nestjs/common';
import { CreateTracklogDto } from './dto/create-tracklog.dto';
import { UpdateTracklogDto } from './dto/update-tracklog.dto';

@Injectable()
export class TracklogsService {
  create(createTracklogDto: CreateTracklogDto) {
    return 'This action adds a new tracklog';
  }

  findAll() {
    return `This action returns all tracklogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tracklog`;
  }

  update(id: number, updateTracklogDto: UpdateTracklogDto) {
    return `This action updates a #${id} tracklog`;
  }

  remove(id: number) {
    return `This action removes a #${id} tracklog`;
  }
}
