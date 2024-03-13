/* eslint-disable testing-library/no-node-access */
import { act, fireEvent, render, screen } from "@testing-library/react";
import LoginComponent from "./LoginComponent";
import user from "@testing-library/user-event";

describe("Login Component test suite", () => {
  const loginServiceMock = {
    login: jest.fn(),
  };
  const setTokenMock = jest.fn();

  let container: HTMLElement;
  function setup() {
    container = render(
      <LoginComponent loginService={loginServiceMock} setToken={setTokenMock} />
    ).container;
    // console.log(container.innerHTML);
  }

  beforeEach(() => {
    setup();
  });

  it("should render correctly login component", () => {
    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeInTheDocument();

    const resultElement = screen.queryByTestId("resultLabel");
    expect(resultElement).not.toBeInTheDocument();
  });

  it("should render correctly - query by test id", () => {
    const inputs = screen.getAllByTestId("input");
    expect(inputs).toHaveLength(3);
    expect(inputs[0].getAttribute("value")).toBe("");
    expect(inputs[1].getAttribute("value")).toBe("");
    expect(inputs[2].getAttribute("value")).toBe("Login");
  });

  it("should render correctly - query by document query", () => {
    const inputs = container.querySelectorAll("input");
    expect(inputs).toHaveLength(3);
    expect(inputs[0].getAttribute("value")).toBe("");
    expect(inputs[1].getAttribute("value")).toBe("");
    expect(inputs[2].getAttribute("value")).toBe("Login");
  });

  it("Click login button with incomplete credentials - show required message", () => {
    const inputs = screen.getAllByTestId("input");
    const loginButton = inputs[2];

    fireEvent.click(loginButton);
    const resultLabel = screen.getByTestId("resultLabel");
    expect(resultLabel?.textContent).toBe("UserName and password required!");
  });

  it("Click login button with incomplete credentials - show required message - with user click", () => {
    const inputs = screen.getAllByTestId("input");
    const loginButton = inputs[2];

    function clickButton() {
      user.click(loginButton);
    }

    act(() => {
      clickButton();
    });

    const resultLabel = screen.getByTestId("resultLabel");
    expect(resultLabel?.textContent).toBe("UserName and password required!");
  });

  it("right credentials - successful login", async () => {
    loginServiceMock.login.mockResolvedValueOnce("1234");
    const inputs = container.querySelectorAll("input");
    const [userNameInput, passwordInput, loginButton] = Array.from(inputs);

    fireEvent.change(userNameInput, { target: { value: "someUser" } });
    fireEvent.change(passwordInput, { target: { value: "somePassword" } });
    fireEvent.click(loginButton);

    expect(loginServiceMock.login).toBeCalledWith("someUser", "somePassword");

    const resultLabel = await screen.findByTestId("resultLabel");
    expect(resultLabel?.textContent).toBe("successful login");
  });

  it("right credentials - successful login - with user calls", async () => {
    loginServiceMock.login.mockResolvedValueOnce("1234");
    const inputs = container.querySelectorAll("input");
    const [userNameInput, passwordInput, loginButton] = Array.from(inputs);

    function userAction() {
      user.click(userNameInput);
      user.keyboard("someUser");

      user.click(passwordInput);
      user.keyboard("somePassword");

      user.click(loginButton);
    }

    act(() => {
      userAction();
    });

    expect(loginServiceMock.login).toBeCalledWith("someUser", "somePassword");

    const resultLabel = await screen.findByTestId("resultLabel");
    expect(resultLabel?.textContent).toBe("successful login");
  });

  it("right credentials - unsuccessful login", async () => {
    loginServiceMock.login.mockResolvedValueOnce(undefined);
    const inputs = container.querySelectorAll("input");
    const [userNameInput, passwordInput, loginButton] = Array.from(inputs);

    fireEvent.change(userNameInput, { target: { value: "someUser" } });
    fireEvent.change(passwordInput, { target: { value: "somePassword" } });
    fireEvent.click(loginButton);

    expect(loginServiceMock.login).toBeCalledWith("someUser", "somePassword");

    const resultLabel = await screen.findByTestId("resultLabel");
    expect(resultLabel?.textContent).toBe("invalid credentials");
  });

  it("right credentials - unsuccessful login - solve act warnings", async () => {
    const result = Promise.resolve(undefined);
    loginServiceMock.login.mockResolvedValueOnce(result);
    const inputs = container.querySelectorAll("input");
    const [userNameInput, passwordInput, loginButton] = Array.from(inputs);

    fireEvent.change(userNameInput, { target: { value: "someUser" } });
    fireEvent.change(passwordInput, { target: { value: "somePassword" } });
    fireEvent.click(loginButton);

    await result;
    expect(loginServiceMock.login).toBeCalledWith("someUser", "somePassword");

    const resultLabel = await screen.findByTestId("resultLabel");
    expect(resultLabel?.textContent).toBe("invalid credentials");
  });
});
