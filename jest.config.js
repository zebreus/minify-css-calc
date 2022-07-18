module.exports = {
  roots: ["<rootDir>/src"],
  moduleDirectories: ["node_modules", "src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  coverageThreshold: {
    global: {
      statements: 100,
    },
  },
};
