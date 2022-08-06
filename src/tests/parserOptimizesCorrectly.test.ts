import { runParser } from "./runParser";

describe("parser does not fail on basic expressions", () => {


  test("supports integers", async () => {
    expect(runParser("calc(4)")).toEqual("4");
    expect(runParser("calc(0)")).toEqual("0");
    expect(runParser("calc(0077)")).toEqual("77");
    expect(runParser("calc(-999)")).toEqual("-999");
  });

  // test("supports floats without rounding", async () => {
  //   expect(runParser("calc(0.823593)")).toEqual("0.823593");
  //   expect(runParser("calc(.984938)")).toEqual("0.984938");
  //   expect(runParser("calc(9897.32894)")).toEqual("9897.32894");
  //   expect(runParser("calc(-9897.32894)")).toEqual("-9897.32894");
  //   expect(() => runParser("calc(56.)")).toThrow();
  // });

  test("supports floats with rounding", async () => {
    expect(runParser("calc(0.823593)")).toEqual("0.82359");
    expect(runParser("calc(.984938)")).toEqual("0.98494");
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

  test("calc is not required in expressiosn", async () => {
    expect(runParser("min(5-3)")).toEqual("2");
    expect(runParser("min(calc(5-3))")).toEqual("2");
    expect(runParser("max(5-3)")).toEqual("2");
    expect(runParser("max(calc(5-3))")).toEqual("2");
    expect(runParser("clamp(0,5-3,6)")).toEqual("2");
    expect(runParser("clamp(0,calc(5-3),6)")).toEqual("2");
    expect(runParser("clamp(5-3,0,6)")).toEqual("2");
    expect(runParser("clamp(calc(5-3),0,6)")).toEqual("2");
    expect(runParser("clamp(0,0,5-3)")).toEqual("0");
    expect(runParser("clamp(0,0,calc(5-3))")).toEqual("0");
  });

  test("empty min is invalid", async () => {
    expect(() => runParser("min(()")).toThrow();
  });

  test("empty max is invalid", async () => {
    expect(() => runParser("max()")).toThrow();
  });

  test("clamp needs three values", async () => {
    expect(() => runParser("clamp()")).toThrow();
    expect(() => runParser("clamp(1)")).toThrow();
    expect(() => runParser("clamp(1,2)")).toThrow();
    expect(() => runParser("clamp(1,2,3,4)")).toThrow();
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
    //Invalid multiplications are allowed as long as they dont end in the final css
    expect(runParser("calc(3deg * 0 * 3deg)")).toEqual("0");
  });

  test("multiplication is able to erase units", () => {
    // This is not in the css standard, but mathematically correct
    expect(runParser("calc(5px/5px)")).toEqual("1");
    expect(runParser("calc(3*5px/5px)")).toEqual("3");
    expect(runParser("calc(5px*3/5px)")).toEqual("3");
    expect(runParser("calc(5px*3px/5px)")).toEqual("3px");
    expect(runParser("calc(5turn*3px/5turn)")).toEqual("3px");
    expect(runParser("calc(5turn*6px/10turn)")).toEqual("3px");
  });

  test("multiplication keeps the correct units in divisions", () => {
    // This is not in the css standard, but mathematically correct
    expect(runParser("calc(500px/2px)")).toEqual("250");
    expect(runParser("calc(500px/2)")).toEqual("250px");
    expect(() => runParser("calc(500/2px)")).toThrow();
    expect(() => runParser("calc(500px/2px/2px)")).toThrow();
  });

  test("nested equations get integrated", () => {
    expect(runParser("calc(((1+1+1)*0.5)*1)")).toEqual("1.5");
  });

  test("does not produce weird errors with nested multiplication 1", () => {
    expect(runParser("calc(1*((1-1-1)*0.5))")).toEqual("-0.5");
    expect(runParser("calc(1*((1-1)*0.5))")).toEqual("0");
    expect(runParser("calc(1*((233vw-233px)/233))")).toEqual("calc(1vw - 1px)");
    expect(runParser("calc((448vw-448px)/112)")).toEqual("calc(4vw - 4px)");
    expect(runParser("calc(1*((448vw-448px)/112))")).toEqual("calc(4vw - 4px)");
    expect(runParser("calc(((100vw - 320px) / 448) * 1)")).toEqual(
      "calc(0.22321vw - 0.71429px)"
    );
    expect(runParser("calc(14px + 6 * ((100vw - 320px) / 448))")).toEqual(
      "calc(1.33929vw + 9.71429px)"
    );
  });

  test("does not produce weird errors with nested multiplication 2", () => {
    expect(runParser("calc((448vw-448px)/112)")).toEqual("calc(4vw - 4px)");
  });
});
