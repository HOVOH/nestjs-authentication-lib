import { Controller, Get } from "@nestjs/common";
import { ReqSession } from "../src/req-session.decorator";
import { Session } from "../src/session";

@Controller()
export class TestController {

  @Get("/")
  test(@ReqSession() session: Session){
    return session;
  }
}
