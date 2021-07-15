import { JwtAccessToken } from "./session";
import * as faker from "faker";

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
