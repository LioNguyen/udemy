# Unit Testing for Typescript & NodeJs Developers with Jest

- [Unit Testing for Typescript \& NodeJs Developers with Jest](#unit-testing-for-typescript--nodejs-developers-with-jest)
  - [1. Resources](#1-resources)
  - [2. How to setup?](#2-how-to-setup)
  - [3. How to test?](#3-how-to-test)
    - [3.1 Test structure](#31-test-structure)
    - [3.2 F.I.R.S.T principles](#32-first-principles)
    - [3.3 Usage](#33-usage)

## 1. Resources

- [Udemy Link](https://www.udemy.com/course/unit-testing-typescript-nodejs/?couponCode=KEEPLEARNING)

## 2. How to setup?

```bash
yarn init -y
yarn add -D typescript ts-node jest ts-jest @jest/types @types/jest

npx ts-jest config:init
```

```js
// jet.config.ts

import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,

  // Only use it when you've done with your implementations without any errors
  // collectCoverage: true,
  // collectCoverageFrom: ["<rootDir>/src/app/**/*.ts"],
};

export default config;
```

## 3. How to test?

### 3.1 Test structure

- arrange, actual, assert

### 3.2 F.I.R.S.T principles

- Fast
- Independent
- Repeatable
- Self-validating
- Thorough

### 3.3 Usage

- Create a function

```js
// app/Number.ts

export function sum(...arg: number[]) {
  return arg.reduce((acc, value) => acc + value);
}
```

- Create unit test
  - `describe` will wrap `test` or `it`
  - `test` and `it` have the same level
  - use `it.each()()` to test lists of results

```js
// test/Number.test.ts

describe("Number test suite", () => {
  // -----
  test("return right sum", () => {
    // arrange
    let sut = sum;

    // actual
    let actual = sut(2, 3);

    // assert
    expect(actual).toBe(5);
  });

  // -----
  it("should return right sum", () => {
    let sut = sum;
    let actual = sut(4, 5);
    expect(actual).toBe(9);
  });

  // -----
  it.each([
    { input: [2, 3], expected: 5 },
    { input: [5, 6], expected: 11 },
    { input: [1, 3], expected: 4 },
  ])("$input should return $expected", ({ input, expected }) => {
    expect(sum.apply(null, input)).toBe(expected);
  });
});
```
