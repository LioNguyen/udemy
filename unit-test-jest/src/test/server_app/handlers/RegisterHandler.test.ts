import { IncomingMessage, ServerResponse } from "http";
import { Authorizer } from "../../../app/server_app/auth/Authorizer";
import { RegisterHandler } from "../../../app/server_app/handlers/RegisterHandler";
import {
  HTTP_CODES,
  HTTP_METHODS,
} from "../../../app/server_app/model/ServerModel";

const getRequestBodyMock = jest.fn();

jest.mock("../../../app/server_app/utils/Utils", () => ({
  getRequestBody: () => getRequestBodyMock(),
}));

describe("RegisterHandler test suite", () => {
  let sut: RegisterHandler;

  const request = {
    method: "",
  };

  const responseMock = {
    statusCode: 0,
    writeHead: jest.fn(),
    write: jest.fn(),
  };

  const authorizerMock = {
    registerUser: jest.fn(),
  };

  const someAccount = {
    id: "",
    password: "somePassword",
    userName: "someUsrName",
  };

  const someId = "1234";

  beforeEach(() => {
    sut = new RegisterHandler(
      request as IncomingMessage,
      responseMock as any as ServerResponse,
      authorizerMock as any as Authorizer
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register valid accounts in requests", async () => {
    request.method = HTTP_METHODS.POST;
    getRequestBodyMock.mockResolvedValueOnce(someAccount);
    authorizerMock.registerUser.mockResolvedValueOnce(someId);

    await sut.handleRequest();
    expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
    expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.CREATED, {
      "Content-Type": "application/json",
    });
    expect(responseMock.write).toHaveBeenCalledWith(
      JSON.stringify({ userId: someId })
    );
  });

  it("should do nothing for not supported http methods", async () => {
    request.method = HTTP_METHODS.GET;
    await sut.handleRequest();

    expect(getRequestBodyMock).not.toHaveBeenCalled();
    expect(responseMock.writeHead).not.toHaveBeenCalled();
    expect(responseMock.write).not.toHaveBeenCalled();
  });
});
