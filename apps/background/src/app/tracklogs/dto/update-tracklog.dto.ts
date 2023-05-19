import { PartialType } from '@nestjs/mapped-types';
import { CreateTracklogDto } from './create-tracklog.dto';

export class UpdateTracklogDto extends PartialType(CreateTracklogDto) {
  id: number;
}
