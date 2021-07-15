import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Session } from "./session";

export class ReqSessionFactory {

  static build(data: string, context: ExecutionContext){
    return ReqSessionFactory.handle(data, context);
  }

  static handle(data: string, context: ExecutionContext) {
    let request = null;
    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest();
    } else if (context.getType() === 'rpc') {
      request = context.switchToRpc().getContext();
    }
    return request?.session || null;
  }

  static mock(handle: (data:string, context: ExecutionContext) => Session) {
    ReqSessionFactory.handle = handle;
  }
}

export const ReqSession = createParamDecorator(ReqSessionFactory.build);
