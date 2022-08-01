import { runParser } from "./runParser";

describe("parser optimizes min, max and clamp", () => {
  test("min works", async () => {
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

  test("min works with variables", async () => {
    expect(runParser("min(var(--toast))")).toEqual("var(--toast)");
    expect(runParser("min(var(--toast), var(--toastB))")).toEqual(
      "min(var(--toast),var(--toastB))"
    );
    expect(runParser("min(1,4,var(--toast))")).toEqual("min(1,var(--toast))");
  });

  test("max works with variables", async () => {
    expect(runParser("max(var(--toast))")).toEqual("var(--toast)");
    expect(runParser("max(var(--toast), var(--toastB))")).toEqual(
      "max(var(--toast),var(--toastB))"
    );
    expect(runParser("max(1,4,var(--toast))")).toEqual("max(4,var(--toast))");
  });

  test("max works", async () => {
    expect(runParser("max(1,4)")).toEqual("4");
    expect(runParser("max(4,1)")).toEqual("4");
    expect(runParser("max(6)")).toEqual("6");
    expect(runParser("max(8,7,9)")).toEqual("9");
    expect(
      runParser("max(44,44,44,44,44,44,44,44,44,44,44,44,44,9,44)")
    ).toEqual("44");
    expect(
      runParser("max(44,44,44,44,44,44,44,44,44,44,44,44,44,99,44)")
    ).toEqual("99");
    expect(runParser("max(1,2,3,4,-99)")).toEqual("4");
    expect(runParser("max(-1,-2,-3,-4,99)")).toEqual("99");
    expect(() => runParser("max()")).toThrow();
  });

  test("clamp works", async () => {
    expect(runParser("clamp(3,4,5)")).toEqual("4");
    expect(runParser("clamp(1,9,4)")).toEqual("4");
    expect(runParser("clamp(-5,29,-3)")).toEqual("-3");
    expect(() => runParser("clamp()")).toThrow();
    expect(() => runParser("clamp(1)")).toThrow();
    expect(() => runParser("clamp(1,2)")).toThrow();
    expect(() => runParser("clamp(1,2,3,4)")).toThrow();
  });

  test("clamps prefers minimum over maximum", async () => {
    expect(runParser("clamp(10,8,5)")).toEqual("10");
    expect(runParser("clamp(10,3,5)")).toEqual("10");
    expect(runParser("clamp(10,12,5)")).toEqual("10");
  });

  test("clamp works with variables", async () => {
    expect(runParser("clamp(1,4,var(--toast))")).toEqual(
      "clamp(1,4,var(--toast))"
    );
    expect(runParser("clamp(4,4,var(--toast))")).toEqual("4");
    expect(runParser("clamp(4,1,var(--toast))")).toEqual("4");
    expect(runParser("clamp(var(--toast),1,4)")).toEqual("max(1,var(--toast))");
    expect(runParser("clamp(var(--toast),1,1)")).toEqual("max(1,var(--toast))");
    expect(runParser("clamp(var(--toast),4,1)")).toEqual("max(1,var(--toast))");
    expect(runParser("clamp(1,var(--toast),4)")).toEqual(
      "clamp(1,4,var(--toast))"
    );
    expect(runParser("clamp(4,var(--toast),4)")).toEqual("4");
    expect(runParser("clamp(4,var(--toast),1)")).toEqual("4");
    expect(runParser("clamp(var(--toastA),4,var(--toast))")).toEqual(
      "clamp(var(--toastA),4,var(--toast))"
    );
    expect(runParser("clamp(4,var(--toastA),var(--toast))")).toEqual(
      "clamp(4,var(--toast),var(--toastA))"
    );
    expect(runParser("clamp(var(--toast),var(--toastA),4)")).toEqual(
      "clamp(var(--toast),4,var(--toastA))"
    );
    expect(
      runParser("clamp(var(--toast),var(--toastA),var(--toastB))")
    ).toEqual("clamp(var(--toast),var(--toastA),var(--toastB))");
  });

  test("clamp works with variables and calc", async () => {
    expect(runParser("clamp(0, calc( 1 * var(--test) ), 1 )")).toEqual(
      "clamp(0,1,var(--test))"
    );
  });

  test("simple nested min and max", async () => {
    expect(runParser("max(1,2)")).toEqual("2");
    expect(runParser("min(3,max(1,2))")).toEqual("2");
    expect(runParser("min(3,max(1,2,var(--test)))")).toEqual(
      "min(3,max(2,var(--test)))"
    );
  });

  test("complex nested min and max", async () => {
    expect(runParser("min(3,max(3,var(--test)))")).toEqual("3"); // "min(3,max(2,var(--test)))"
    expect(runParser("min(3px,3rem,max(3rem, 3px, var(--test)))")).toEqual(
      "min(3px,3rem)"
    );
    expect(
      runParser("min(3px,3rem,max(3rem, 3px, var(--test)),var(--test))")
    ).toEqual("min(3px,3rem,max(3px,3rem,var(--test)),var(--test))");
  });

  test("nested min works", async () => {
    expect(runParser("min(3em,min(3px,3rem))")).toEqual("min(3em,3px,3rem)");
    expect(runParser("min(3em,3px,var(--test))")).toEqual(
      "min(3em,3px,var(--test))"
    );
    expect(runParser("min(3em,min(3px,var(--test)))")).toEqual(
      "min(3em,3px,var(--test))"
    );
  });

  test("nested min and max get integrated", async () => {
    expect(runParser("min(min(3))")).toEqual("3");
    expect(runParser("min(3em,min(3px,var(--test)))")).toEqual(
      "min(3em,3px,var(--test))"
    );
    expect(runParser("min(3em,min(3px,max(var(--test), 3em)))")).toEqual(
      "min(3em,3px)"
    );
  });

  test("weird clamp expression does work", async () => {
    expect(runParser("clamp(0,calc(0.5 + (0.5*0.5)),1)")).toEqual("0.75");
  });
});
