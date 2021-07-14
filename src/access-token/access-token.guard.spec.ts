import { AccessTokenGuard } from "./access-token.guard";
import { Test } from "@nestjs/testing";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { createMock } from "@golevelup/ts-jest";
import { ExecutionContext } from "@nestjs/common";
import * as faker from "faker";
import { JwtAccessToken } from "../session";
import { serialize } from "@hovoh/nestjs-api-lib";
import { BAD_ACCESS_TOKEN, NO_ACCESS_TOKEN } from "../error.codes";

const iAccessTokenFactory = (defaults?: Partial<JwtAccessToken>) => {
  const startDate = new Date()
  return Object.assign({
    anon: false,
    uuid: faker.datatype.uuid(),
    userUuid: faker.datatype.uuid(),
    startedAt: startDate,
    validUntil: new Date(startDate.valueOf()+(10*60*1000)),
  }, defaults);
}

describe("Access Token Guard", () => {
  let accessTokenGuard: AccessTokenGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ JwtModule.register({secret: "secret"})]
    }).compile();
    jwtService = moduleRef.get<JwtService>(JwtService);
    accessTokenGuard = new AccessTokenGuard(jwtService);
  })

  it("anonymousSession() should return an anonymous", () => {
    expect(accessTokenGuard.anonymousSession().anon).toBe(true);
  })

  it("authAs() should set the session key on the request", () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.getType.mockReturnValue("http");
    accessTokenGuard.authAs(mockExecutionContext, accessTokenGuard.anonymousSession());
    expect(accessTokenGuard.getRequest(mockExecutionContext).session).toBeTruthy()
  })

  it("verifyAccessToken() should verify return a session", () => {
    const accessToken = iAccessTokenFactory();
    const signedAccessToken = jwtService.sign(serialize(accessToken));
    const session = accessTokenGuard.verifyAccessToken(signedAccessToken);
    expect(session.uuid).toEqual(accessToken.uuid);
    expect(session.userUuid).toEqual(accessToken.userUuid);
    expect(session.validUntil).toEqual(accessToken.validUntil);
    expect(session.startedAt).toEqual(accessToken.startedAt);
  })

  it("verifyAccessToken() should throw if JWT is signed with the wrong secret", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ JwtModule.register({secret: "bad_secret"})]
    }).compile();
    const badJwtService = moduleRef.get<JwtService>(JwtService);
    const accessToken = iAccessTokenFactory();
    const signedAccessToken = badJwtService.sign(serialize(accessToken));
    expect(() => accessTokenGuard.verifyAccessToken(signedAccessToken)).toThrow(BAD_ACCESS_TOKEN);
  })

  it("getJwtFromHttp() should return the signed jwt from cookies", () => {
    const accessToken = iAccessTokenFactory();
    const signedAccessToken = jwtService.sign(serialize(accessToken));
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({cookies:{hovoh_access: signedAccessToken}})
    expect(accessTokenGuard.getJwtFromHttp(mockExecutionContext)).toEqual(signedAccessToken);
  })

  it("getJwtFromRPC() should return the signed jwt from headers", () => {
    expect.assertions(2)
    const accessToken = iAccessTokenFactory();
    const signedAccessToken = jwtService.sign(serialize(accessToken));
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.switchToRpc().getContext.mockReturnValue({
      get: (arg: string) => {
        expect(arg).toEqual("Authorization");
        return "Bearer "+signedAccessToken;
      }
    })
    expect(accessTokenGuard.getJwtFromRpc(mockExecutionContext)).toEqual(signedAccessToken);
  })

  it("should let user activate if token is valid", () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.getType.mockReturnValue("http");
    const accessToken = iAccessTokenFactory();
    const signedAccessToken = jwtService.sign(serialize(accessToken));
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({cookies:{hovoh_access: signedAccessToken}})
    expect(accessTokenGuard.canActivate(mockExecutionContext)).toBe(true);
    expect(accessTokenGuard.getRequest(mockExecutionContext).session.uuid).toEqual(accessToken.uuid)
  })

  it("should not let user activate if token is invalid", async () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.getType.mockReturnValue("http");
    const moduleRef = await Test.createTestingModule({
      imports: [ JwtModule.register({secret: "bad_secret"})]
    }).compile();
    const badJwtService = moduleRef.get<JwtService>(JwtService);
    const accessToken = iAccessTokenFactory();
    const signedAccessToken = badJwtService.sign(serialize(accessToken));
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({cookies:{hovoh_access: signedAccessToken}})
    expect(() => accessTokenGuard.canActivate(mockExecutionContext)).toThrow(BAD_ACCESS_TOKEN);
  })

  it("should not let user activate if there is not token", async () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.getType.mockReturnValue("http");
    expect(() => accessTokenGuard.canActivate(mockExecutionContext)).toThrow(NO_ACCESS_TOKEN);
  })

  it("should start anon session if route is public", async () => {
    const getMetadata = Reflect.getMetadata;
    Reflect.getMetadata = (key: any, target: any) => {
      if (key === "hovoh-is-public") {
        return true;
      } else {
        return getMetadata(key, target);
      }
    }
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.getType.mockReturnValue("http");
    expect(accessTokenGuard.canActivate(mockExecutionContext)).toBe(true);
    expect(accessTokenGuard.getRequest(mockExecutionContext).session.anon).toBe(true);
  })

  it("should start anon session if route is public but bad token", async () => {
    const getMetadata = Reflect.getMetadata;
    Reflect.getMetadata = (key: any, target: any) => {
      if (key === "hovoh-is-public") {
        return true;
      } else {
        return getMetadata(key, target);
      }
    }
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.getType.mockReturnValue("http");
    const moduleRef = await Test.createTestingModule({
      imports: [ JwtModule.register({secret: "bad_secret"})]
    }).compile();
    const badJwtService = moduleRef.get<JwtService>(JwtService);
    const accessToken = iAccessTokenFactory();
    const signedAccessToken = badJwtService.sign(serialize(accessToken));
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({cookies:{hovoh_access: signedAccessToken}})
    expect(accessTokenGuard.canActivate(mockExecutionContext)).toBe(true);
    expect(accessTokenGuard.getRequest(mockExecutionContext).session.anon).toBe(true)
  })

})
