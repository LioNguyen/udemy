import {
  PasswordChecker,
  PasswordErrors,
} from "../../app/pass_checker/PasswordChecker";

describe("PasswordChecker test suite", () => {
  let sut: PasswordChecker;

  // arrange
  beforeEach(() => {
    sut = new PasswordChecker();
  });

  // it("Password with less than 8 chars is invalid", () => {
  //   const actual = sut.checkPassword("1234567");
  //   expect(actual).toBeTruthy;
  // });

  it.each([
    {
      message: "Password with less than 8 chars is invalid",
      input: "123",
      expected: false,
      expectedMessage: PasswordErrors.SHORT,
    },
    {
      message: "Password with more than 8 chars is valid",
      input: "12345678Aa",
      expected: true,
      expectedMessage: PasswordErrors.SHORT,
      type: "negative",
    },
    {
      message: "Password with no upper case letter is invalid",
      input: "1234abcd",
      expected: false,
      expectedMessage: PasswordErrors.NO_UPPER_CASE,
    },
    {
      message: "Password with upper case letter is valid",
      input: "1234aBcd",
      expected: true,
      expectedMessage: PasswordErrors.NO_UPPER_CASE,
      type: "negative",
    },
    {
      message: "Password with no lower case letter is invalid",
      input: "1234ABCD",
      expected: false,
      expectedMessage: PasswordErrors.NO_LOWER_CASE,
    },
    {
      message: "Password with lower case letter is valid",
      input: "1234aBcD",
      expected: true,
      expectedMessage: PasswordErrors.NO_LOWER_CASE,
      type: "negative",
    },
  ])("$message: $input", ({ input, expected, expectedMessage, type }) => {
    const actual = sut.checkPassword(input);

    if (type === "negative") {
      expect(actual.reasons).not.toContain(expectedMessage);
    } else {
      expect(actual.reasons).toContain(expectedMessage);
    }
    expect(actual.valid).toBe(expected);
  });

  it("Complex password is valid", () => {
    const actual = sut.checkAdminPassword("1234abcdA");
    expect(actual.reasons).toHaveLength(0);
    expect(actual.valid).toBe(true);
  });

  it("Admin password with no number is invalid", () => {
    const actual = sut.checkAdminPassword("abcdABCD");
    expect(actual.reasons).toContain(PasswordErrors.NO_NUMBER);
    expect(actual.valid).toBe(false);
  });

  it("Admin password with number is valid", () => {
    const actual = sut.checkAdminPassword("123abcdA");
    expect(actual.reasons).not.toContain(PasswordErrors.NO_NUMBER);
    expect(actual.valid).toBe(true);
  });
});
