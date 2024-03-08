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
