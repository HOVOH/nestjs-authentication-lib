import { Test } from "@nestjs/testing";
import { TestController } from "./test.controller";
import * as request from 'supertest';
import { ReqSessionFactory } from "../src/req-session.decorator";
import { iAccessTokenFactory } from "../src/testhelpers";
import { JwtModule } from "@nestjs/jwt";

describe("ReqSession decorator", () => {
  it("Can be mocked", async () => {
    const session = iAccessTokenFactory()
    ReqSessionFactory.mock(() => (session))

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({secret:"hello"})],
      controllers: [TestController]
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init()

    return request(app.getHttpServer())
      .get("/session")
      .expect(JSON.stringify(session));
  })
})
