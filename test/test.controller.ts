import { Controller, Get, UseGuards } from "@nestjs/common";
import { ReqSession } from "../src/req-session.decorator";
import { Session } from "../src/session";
import { AccessTokenGuard } from "../src/main";
import { CatchApplicationError } from "@hovoh/nestjs-application-error";
import { authErrorStatusMap } from "../src/error.codes";

@Controller()
@CatchApplicationError(authErrorStatusMap)
export class TestController {

  @Get("/session")
  session(@ReqSession() session: Session){
    return session;
  }

  @Get("/guard")
  @UseGuards(AccessTokenGuard)
  guard(){
    return ""
  }

}
