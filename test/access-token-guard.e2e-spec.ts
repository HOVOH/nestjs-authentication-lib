import { Test } from "@nestjs/testing";
import { TestController } from "./test.controller";
import * as request from 'supertest';
import { ReqSessionFactory } from "../src/req-session.decorator";
import { iAccessTokenFactory } from "../src/testhelpers";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { HttpStatus, INestApplication } from "@nestjs/common";
import * as cookieParser from 'cookie-parser';
describe("ReqSession decorator", () => {

  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({secret:"hello"})],
      controllers: [TestController]
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);

    app = moduleRef.createNestApplication();
    app.use(cookieParser())
    await app.init()
  })

  it("should send 401 if no token", async () => {
    return request(app.getHttpServer())
      .get("/guard")
      .expect(HttpStatus.UNAUTHORIZED);
  })

  it("should return 200 if jwt is valid", () => {
    const session = iAccessTokenFactory();
    const at = jwtService.sign(session);
    return request(app.getHttpServer())
      .get("/guard")
      .set('Cookie', ["hovoh_access="+at])
      .expect(HttpStatus.OK);
  })

  it("should return 403 if jwt is invalid", async () => {
    const session = iAccessTokenFactory();
    const moduleRef = await Test.createTestingModule({
      imports:[JwtModule.register({secret: "bad_secret"})]
    }).compile();
    const badJwtService = moduleRef.get<JwtService>(JwtService);
    const at = badJwtService.sign(session);
    return request(app.getHttpServer())
      .get("/guard")
      .set('Cookie', ["hovoh_access="+at])
      .expect(HttpStatus.FORBIDDEN);
  })

  afterAll(async () => await app.close())
})
