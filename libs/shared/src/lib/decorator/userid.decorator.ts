import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import admin from '../config/firebase';

export const UserId = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const token = request.headers.authorization?.split(' ')[1];
    console.log('token', token);

    try {
      const decodeValue = await admin.auth().verifyIdToken(token);

      return decodeValue.uid;
    } catch (e) {
      console.log(e);
    }
  }
);
