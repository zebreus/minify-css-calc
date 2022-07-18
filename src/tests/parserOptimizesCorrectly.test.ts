import { runParser } from "./runParser";

describe("parser does not fail on basic expressions", () => {
  test("empty string is not valid", async () => {
    expect(() => runParser("")).toThrow();
    expect(() => runParser("calc()")).toThrow();
  });

  test("only numbers are valid", async () => {
    expect(runParser("2")).toEqual("2");
    expect(runParser(".9")).toEqual("0.9");
    expect(runParser("-10")).toEqual("-10");
    expect(runParser("+10")).toEqual("10");
  });

  test("toplevel expressions are not valid", async () => {
    expect(() => runParser("5+10")).toThrow();
    expect(() => runParser("5-10")).toThrow();
    expect(() => runParser("5/10")).toThrow();
    expect(() => runParser("5*10")).toThrow();
    expect(() => runParser("(10)")).toThrow();
  });

  test("supports integers", async () => {
    expect(runParser("calc(4)")).toEqual("4");
    expect(runParser("calc(0)")).toEqual("0");
    expect(runParser("calc(0077)")).toEqual("77");
    expect(runParser("calc(-999)")).toEqual("-999");
  });

  test("supports floats", async () => {
    expect(runParser("calc(0.823593)")).toEqual("0.823593");
    expect(runParser("calc(.984938)")).toEqual("0.984938");
    expect(runParser("calc(9897.32894)")).toEqual("9897.32894");
    expect(runParser("calc(-9897.32894)")).toEqual("-9897.32894");
    expect(() => runParser("calc(56.)")).toThrow();
  });

  test("basic calc works as expected", async () => {
    expect(runParser("calc(4)")).toEqual("4");
  });

  test("brackets work", async () => {
    expect(runParser("calc(((4)))")).toEqual("4");
  });

  test("basic integer arithmetic works", async () => {
    expect(runParser("calc(4+5)")).toEqual("9");
    expect(runParser("calc(5-4)")).toEqual("1");
    expect(runParser("calc(4-5)")).toEqual("-1");
    expect(runParser("calc(20/5)")).toEqual("4");
    expect(runParser("calc(4*64)")).toEqual("256");
  });

  test("order is correct", async () => {
    expect(runParser("calc(4+2*3)")).toEqual("10");
    expect(runParser("calc(4+12/2)")).toEqual("10");
    expect(runParser("calc(4*2+3)")).toEqual("11");
  });

  test("nested calc works", async () => {
    expect(runParser("calc(calc(4))")).toEqual("4");
    expect(runParser("calc(4*calc(4)+4)")).toEqual("20");
    expect(runParser("calc(calc(calc(calc(4)))*calc(4))")).toEqual("16");
  });

  test("var works", async () => {
    expect(runParser("var(--toast)")).toEqual("var(--toast)");
  });

  test("calc is required in expressiosn", async () => {
    expect(() => runParser("min(5-3)")).toThrow();
    expect(() => runParser("min(calc(5-3))")).not.toThrow();
    expect(() => runParser("max(5-3)")).toThrow();
    expect(() => runParser("max(calc(5-3))")).not.toThrow();
    expect(() => runParser("clamp(0,5-3,6)")).toThrow();
    expect(() => runParser("clamp(0,calc(5-3),6)")).not.toThrow();
    expect(() => runParser("clamp(5-3,0,6)")).toThrow();
    expect(() => runParser("clamp(calc(5-3),0,6)")).not.toThrow();
    expect(() => runParser("clamp(0,0,5-3)")).toThrow();
    expect(() => runParser("clamp(0,0,calc(5-3))")).not.toThrow();
  });

  test("extra test", async () => {
    expect(runParser("min(1,4)")).toEqual("1");
    expect(runParser("min(4,1)")).toEqual("1");
    expect(runParser("min(6)")).toEqual("6");
    expect(runParser("min(8,7,9)")).toEqual("7");
    expect(
      runParser("min(44,44,44,44,44,44,44,44,44,44,44,44,44,9,44)")
    ).toEqual("9");
    expect(runParser("min(1,2,3,4,-99)")).toEqual("-99");
    expect(() => runParser("min()")).toThrow();
  });

  test("valid additions dont throw", async () => {
    expect(() => runParser("calc(3px + 5px)")).not.toThrow();
    expect(() => runParser("calc(3px + 5rem)")).not.toThrow();
    expect(() => runParser("calc(3deg + 5turn)")).not.toThrow();
    expect(() => runParser("calc(3x + 5dpi)")).not.toThrow();
  });

  test("invalid addition throws", async () => {
    expect(() => runParser("calc(3px + 5)")).toThrow();
    expect(() => runParser("calc(3rem + 5)")).toThrow();
    expect(() => runParser("calc(3x + 5)")).toThrow();
    expect(() => runParser("calc(3ms + 5)")).toThrow();
    expect(() => runParser("calc(3deg + 5)")).toThrow();
  });

  test("valid multiplications dont throw", async () => {
    expect(() => runParser("calc(3px * 5)")).not.toThrow();
    expect(() => runParser("calc(3px * 5 * 10)")).not.toThrow();
    expect(() => runParser("calc(5 * 3deg * 5)")).not.toThrow();
    expect(() => runParser("calc(5 * 5)")).not.toThrow();
    expect(() => runParser("calc(5 * 0)")).not.toThrow();
  });

  test("invalid multiplications throws", async () => {
    expect(() => runParser("calc(3px * 5px)")).toThrow();
    expect(() => runParser("calc(3rem * 5px)")).toThrow();
    expect(() => runParser("calc(3x * 5deg)")).toThrow();
    expect(() => runParser("calc(3ms * 5s)")).toThrow();
    expect(() => runParser("calc(3deg * 17 * 3deg)")).toThrow();
    expect(() => runParser("calc(3deg * 0 * 3deg)")).toThrow();
  });
});
