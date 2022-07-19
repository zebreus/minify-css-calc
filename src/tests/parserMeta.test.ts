import { runParser } from "./runParser";

describe("parser works on strings that are more then just equations", () => {
  test("works with vars", async () => {
    expect(runParser("calc(var(--test))")).toEqual("var(--test)");
    expect(runParser("calc(var(--test) + 1)")).toEqual("calc(1 + var(--test))");
  });

  test("default values in vars work", async () => {
    expect(runParser("calc(var(--test, 40px))")).toEqual("var(--test, 40px)");
    expect(runParser("calc(var(--test, #fff))")).toEqual("var(--test, #fff)");
  });

  test("default values in vars get optimized", async () => {
    expect(runParser("calc(var(--test, calc(20px + 20px)))")).toEqual(
      "var(--test, 40px)"
    );
  });
});
