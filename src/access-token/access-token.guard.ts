import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ACCESS_COOKIE_NAME } from './constants';
import { isPublic } from './public.decorator';
import { ApplicationError } from '@hovoh/nestjs-application-error';
import { NO_ACCESS_TOKEN, BAD_ACCESS_TOKEN } from '../error.codes';
import {
  AnonymousSession,
  IAccessToken,
  Session,
  SignedAccessToken,
} from '../session';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const accessToken = this.getAccessToken(context);
    if (!accessToken && isPublic(context)) {
      this.authAs(context, this.anonymousSession());
      return true;
    } else if (!accessToken && !isPublic(context)) {
      throw new ApplicationError(NO_ACCESS_TOKEN);
    }
    try {
      const session = this.verifyAccessToken(accessToken);
      this.authAs(context, session);
    } catch (e) {
      if (isPublic(context)) {
        this.authAs(context, this.anonymousSession());
      } else {
        throw e;
      }
    }
    return true;
  }

  getAccessToken(context: ExecutionContext): SignedAccessToken {
    if (context.getType() === 'http') {
      return this.getJwtFromHttp(context);
    } else if (context.getType() === 'rpc') {
      return this.getJwtFromRpc(context);
    }
    return null;
  }

  getJwtFromHttp(context: ExecutionContext): SignedAccessToken {
    const { cookies } = this.getRequest(context);
    if (cookies) {
      return cookies[ACCESS_COOKIE_NAME] ? cookies[ACCESS_COOKIE_NAME] : null;
    }
    return null;
  }

  private getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    } else if (context.getType() === 'rpc') {
      return context.switchToRpc().getContext();
    }
    return null;
  }

  getJwtFromRpc(context: ExecutionContext) {
    const request = this.getRequest(context);
    const authorization: string = request.get('Authorization');
    if (authorization.includes('Bearer ')) {
      return authorization.split(' ')[1];
    }
    return null;
  }

  authAs(context: ExecutionContext, session: Session | AnonymousSession) {
    const request = this.getRequest(context);
    request.session = session;
  }

  anonymousSession() {
    return new AnonymousSession();
  }

  verifyAccessToken(accessToken: SignedAccessToken): Session {
    try {
      const token = this.jwtService.verify(accessToken) as IAccessToken;
      return Session.fromAccessToken(token);
    } catch (e) {
      throw new ApplicationError(BAD_ACCESS_TOKEN);
    }
  }
}
