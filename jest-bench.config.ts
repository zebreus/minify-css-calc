const config = {
  roots: ["<rootDir>/src"],
  moduleDirectories: ["node_modules", "src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testEnvironment: "@zebreus/jest-bench/environment",
  reporters: ["default", "@zebreus/jest-bench/reporter"],
  testRegex: "(/__benchmarks__/.*|\\.bench)\\.(ts|tsx|js)$",
};

export default config;
