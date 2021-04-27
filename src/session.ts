export interface IAccessToken {
  anon: boolean;
  uuid: string;
  userUuid: string;
  startedAt: Date;
  validUntil: Date;
}

export type SignedAccessToken = string;

export class AnonymousSession implements IAccessToken {
  anon = true;
  startedAt: Date = null;
  userUuid: string = null;
  uuid: string = null;
  validUntil: Date = null;
}

export class Session implements IAccessToken {
  anon = false;
  uuid: string;
  userUuid: string;
  startedAt: Date;
  validUntil: Date;

  constructor(
    uuid: string,
    userUuid: string,
    startedAt: Date,
    validUntil: Date,
  ) {
    this.uuid = uuid;
    this.userUuid = userUuid;
    this.startedAt = startedAt;
    this.validUntil = validUntil;
  }

  static fromAccessToken(accessToken: IAccessToken) {
    return new Session(
      accessToken.uuid,
      accessToken.userUuid,
      accessToken.startedAt,
      accessToken.validUntil,
    );
  }
}
