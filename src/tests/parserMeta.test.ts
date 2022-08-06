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

describe("parser is predictable in invalid scenarios", () => {
  test("empty string is not valid", async () => {
    expect(() => runParser("")).not.toThrow();
    expect(() => runParser("calc()")).toThrow();
  });

  // Currently skipped, as Big.js does not support positive signed integers. PR is opened
  test.skip("only numbers are valid", async () => {
    expect(runParser("2")).toEqual("2");
    expect(runParser(".9")).toEqual("0.9");
    expect(runParser("-10")).toEqual("-10");
    expect(runParser("+10")).toEqual("10");
  });

  test("toplevel expressions are not valid", async () => {
    expect(() => runParser("5  10")).not.toThrow();
    expect(() => runParser("5 , 10 , 9")).not.toThrow();
    expect(() => runParser("5-10")).toThrow();
    expect(() => runParser("5 -10")).not.toThrow();
    expect(() => runParser("5- 10")).toThrow();
    expect(() => runParser("5 - 10")).toThrow();
  });

  test("toplevel expressions are not valid", async () => {
    expect(() => runParser("5+10")).toThrow();
    expect(() => runParser("5-10")).toThrow();
    expect(() => runParser("5/10")).toThrow();
    expect(() => runParser("5*10")).toThrow();
    expect(() => runParser("(10)")).toThrow();
  });

  test("throws on brackets without calc", () => {
    expect(() => runParser("(4)")).toThrow();
    expect(() => runParser("(4 + 4)")).toThrow();
    expect(() => runParser("(4+4)")).toThrow();
  });

  test("throws on unknown function", () => {
    expect(() => runParser("unknownFunction()")).toThrow();
  });
});
