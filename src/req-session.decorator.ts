import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const reqSessionFactory = (data: string, context: ExecutionContext) => {
  let request = null;
  if (context.getType() === 'http') {
    request = context.switchToHttp().getRequest();
  } else if (context.getType() === 'rpc') {
    request = context.switchToRpc().getContext();
  }
  return request?.session || null;
}

export const ReqSession = createParamDecorator(reqSessionFactory);
