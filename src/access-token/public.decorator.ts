import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const METADATA_KEY = 'hovoh-is-public';

export const Public = () => SetMetadata(METADATA_KEY, true);

export const isPublic = (context: ExecutionContext) => {
  const reflector = new Reflector();
  return !!reflector.get<boolean>(METADATA_KEY, context.getHandler());
};
