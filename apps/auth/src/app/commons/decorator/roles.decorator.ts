/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { SetMetadata } from '@nestjs/common';

import { Role } from 'apps/user/src/app/users/entity/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
