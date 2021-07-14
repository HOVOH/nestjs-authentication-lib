import { createMock } from "@golevelup/ts-jest";
import { ExecutionContext } from "@nestjs/common";
import { reqSessionFactory } from "./req-session.decorator";

describe("ReqSession decorator", () => {
  it("Should switch to http if type is http", () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.getType.mockReturnValue("http");
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({session: { uuid: "hello"}})
    const reqSession = reqSessionFactory("", mockExecutionContext);
    expect(mockExecutionContext.switchToHttp).toBeCalled();
    expect(reqSession).toBeTruthy();
  })

  it("Should switch to rpc if type is rpc", () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.getType.mockReturnValue("rpc");
    mockExecutionContext.switchToRpc().getContext.mockReturnValue({session: {uuid: "hello"}})
    const reqSession = reqSessionFactory("", mockExecutionContext);
    expect(mockExecutionContext.switchToRpc).toBeCalled();
    expect(reqSession).toBeTruthy();
  })

  it("Should return undefined session", () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    const reqSession = reqSessionFactory("", mockExecutionContext);
    expect(reqSession).toBeNull()
  })

})
