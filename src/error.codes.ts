import { HttpStatus } from "@nestjs/common";

export const BAD_REFRESH_TOKEN = 'bad_refresh_token';
export const BAD_ACCESS_TOKEN = 'bad_access_token';
export const BAD_CREDENTIALS = 'bad_credentials';
export const NO_ACCESS_TOKEN = 'no_access_token';
export const NO_REFRESH_TOKEN = 'no_refresh_token';

export const authErrorStatusMap = {
  [NO_ACCESS_TOKEN]: HttpStatus.UNAUTHORIZED,
  [NO_REFRESH_TOKEN]: HttpStatus.UNAUTHORIZED,
  [BAD_ACCESS_TOKEN]: HttpStatus.FORBIDDEN,
}
