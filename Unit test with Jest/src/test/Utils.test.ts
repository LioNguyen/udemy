import { StringUtils, getStringInfo, toUpperCase } from "../app/Utils";

describe("Utils test suite", () => {
  describe("StringUtils tests", () => {
    let sut: StringUtils;

    beforeEach(() => {
      sut = new StringUtils();
      console.log("Setup");
    });

    afterEach(() => {
      console.log("Tear down");
    });

    it.todo("Test long strings");

    // it.only = fit
    it.only("Should return correct upperCase", () => {
      const actual = sut.toUpperCase("abc");
      expect(actual).toBe("ABC");
      console.log("Actual test");
    });

    // it.skip = xit
    it.skip("Should throw error on invalid argument - function", () => {
      function expectError() {
        const actual = sut.toUpperCase("");
      }

      expect(expectError).toThrow();
    });

    it("Should throw error on invalid argument - arrow function", () => {
      expect(() => {
        sut.toUpperCase("");
      }).toThrow();
    });

    it("Should throw error on invalid argument - try catch block", () => {
      try {
        sut.toUpperCase("");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty("message", "");
      }
    });
  });

  it("should return uppercase of valid string", () => {
    // arrange
    const sut = toUpperCase;
    const expected = "ABC";

    // act
    const actual = sut("abc");

    // assert
    expect(actual).toBe(expected);
  });

  describe("ToUpperCase examples", () => {
    it.each([
      {
        input: "abc",
        expected: "ABC",
      },
      {
        input: "My-String",
        expected: "MY-STRING",
      },
      {
        input: "def",
        expected: "DEF",
      },
    ])("$input toUpperCase should be $expected", ({ input, expected }) => {
      const actual = toUpperCase(input);
      expect(actual).toBe(expected);
    });
  });

  describe("getStringInfo for arg My-String should", () => {
    test("return right length", () => {
      const sut = getStringInfo;
      const actual = sut("My-String");
      expect(actual.length).toBe(9);
    });
    test("return right lower case", () => {
      const sut = getStringInfo;
      const actual = sut("My-String");
      expect(actual.lowerCase).toBe("my-string");
    });
    test("return right upper case", () => {
      const sut = getStringInfo;
      const actual = sut("My-String");
      expect(actual.upperCase).toBe("MY-STRING");
    });
    test("return right length", () => {
      const sut = getStringInfo;
      const actual = sut("My-String");
      expect(actual.length).toBe(9);
      expect(actual).toHaveLength(9);
    });
    test("return right characters", () => {
      const sut = getStringInfo;
      const actual = sut("My-String");
      expect(actual.characters).toEqual([
        "M",
        "y",
        "-",
        "S",
        "t",
        "r",
        "i",
        "n",
        "g",
      ]);
      expect(actual.characters).toContain<string>("M");
      expect(actual.characters).toEqual(
        expect.arrayContaining(["S", "t", "r", "i", "n", "g", "M", "y", "-"])
      ); // This method only content, do not check text orders
    });
    test("return defined extra info", () => {
      const sut = getStringInfo;
      const actual = sut("My-String");
      expect(actual.extraInfo).toEqual({}); // toEqual applied for object
      expect(actual.extraInfo).not.toBe(undefined);
      expect(actual.extraInfo).not.toBeUndefined;
      expect(actual.extraInfo).toBeDefined;
      expect(actual.extraInfo).toBeTruthy;
    });
  });
});
