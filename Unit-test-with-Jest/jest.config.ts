import type { Config } from "@jest/types";

// const baseDir = "<rootDir>/src/app/pass_checker";
// const baseTestDir = "<rootDir>/src/test/pass_checker";
const baseDir = "<rootDir>/src/app/server_app";
const baseTestDir = "<rootDir>/src/test/server_app";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,

  // Only use it when you've done with your implementations without any errors
  collectCoverage: true,
  collectCoverageFrom: [`${baseDir}/**/*.ts`],
  testMatch: [`${baseTestDir}/**/*.ts`],
};

export default config;
