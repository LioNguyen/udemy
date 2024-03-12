import { sum } from "../../app/practice/Practice";

describe("Practice test suite", () => {
  test("Tracking original sum", () => {
    const sut = sum;

    const actual = sut(1, 2);
    expect(actual).toBe(3);
  });

  // jest.fn(implementation) is a shorthand for jest.fn().mockImplementation(implementation).
  test("Tracking mock sum", () => {
    const mock = jest.fn((a, b) => {
      return a + b;
    });

    const actual = mock(2, 3);
    expect(actual).toBe(5);
  });
});
