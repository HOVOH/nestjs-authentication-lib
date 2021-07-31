import { JwtAccessToken } from "./session";
import * as faker from "faker";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { AccessTokenGuard } from "./access-token/access-token.guard";
import { Observable } from "rxjs";
import { Session, AnonymousSession } from "./session";

export const iAccessTokenFactory = (defaults?: Partial<JwtAccessToken>) => {
  const startDate = new Date()
  return Object.assign({
    anon: false,
    uuid: faker.datatype.uuid(),
    userUuid: faker.datatype.uuid(),
    startedAt: startDate,
    validUntil: new Date(startDate.valueOf()+(10*60*1000)),
  }, defaults);
}

@Injectable()
export class FakeAccessTokenGuard extends AccessTokenGuard {

  constructor(public session?: Session | AnonymousSession) {
    super(null);
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (this.session){
      this.authAs(context, this.session);
    }
    return true;
  }

  static register(session?: Session | AnonymousSession){
    return {
      provide: AccessTokenGuard,
      useValue: new FakeAccessTokenGuard(session),
    }
  }

  mockSession(session?: Session | AnonymousSession){
    this.session = session;
  }

}
