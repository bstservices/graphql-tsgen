module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  testPathIgnorePatterns: [
    "/node_modules/",
    // "example" files used as input data for some tests
    "/[^/]+\\.ex\\.tsx?$",
  ],

  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.test.json",
    },
  },
};
