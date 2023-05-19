import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import admin from '../../config/firebase';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.split(' ')[1];
    console.log('token', token);

    try {
      const decodeValue = await admin.auth().verifyIdToken(token);

      if (decodeValue) {
        return true;
      }
    } catch (e) {
      console.log(e);
      if (e.code === 'auth/argument-error') {
        throw new UnauthorizedException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
