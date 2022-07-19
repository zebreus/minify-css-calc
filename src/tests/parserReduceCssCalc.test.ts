import { runParser } from "./runParser";

describe("parser passes the same test suite as reduce-css-calc", () => {
  test("should reduce simple calc (1)", () => {
    expect(runParser("calc(1px + 1px)")).toEqual("2px");
  });

  test("should reduce simple calc (2)", () => {
    expect(runParser("calc(3em - 1em)")).toEqual("2em");
  });

  test("should reduce simple calc (3)", () => {
    expect(runParser("calc(1rem * 1.5)")).toEqual("1.5rem");
  });

  test("should reduce simple calc (4)", () => {
    expect(runParser("calc(2ex / 2)")).toEqual("1ex");
  });

  test("should reduce simple calc (5)", () => {
    expect(runParser("calc(50px - (20px - 30px))")).toEqual("60px");
  });

  test("should reduce simple calc (6)", () => {
    expect(runParser("calc(100px - (100px - 100%))")).toEqual("100%");
  });

  test("should reduce simple calc (7)", () => {
    expect(runParser("calc(100px + (100px - 100%))")).toEqual(
      "calc(200px - 100%)"
    );
  });

  test("should reduce additions and subtractions (1)", () => {
    expect(runParser("calc(100% - 10px + 20px)")).toEqual("calc(100% + 10px)");
  });

  test("should reduce additions and subtractions (2)", () => {
    expect(runParser("calc(100% + 10px - 20px)")).toEqual("calc(100% - 10px)");
  });

  test("should handle fractions", () => {
    expect(runParser("calc(10.px + .0px)")).toEqual("10px");
  });

  test("should ignore value surrounding calc function (1)", () => {
    expect(runParser("a calc(1px + 1px)")).toEqual("a 2px");
  });

  test("should ignore value surrounding calc function (2)", () => {
    expect(runParser("calc(1px + 1px) a")).toEqual("2px a");
  });

  test("should ignore value surrounding calc function (3)", () => {
    expect(runParser("a calc(1px + 1px) b")).toEqual("a 2px b");
  });

  test("should ignore value surrounding calc function (4)", () => {
    expect(runParser("a calc(1px + 1px) b calc(1em + 2em) c")).toEqual(
      "a 2px b 3em c"
    );
  });

  test("should reduce nested calc", () => {
    expect(runParser("calc(100% - calc(50% + 25px))")).toEqual(
      "calc(50% - 25px)"
    );
  });

  test("should reduce prefixed nested calc", () => {
    expect(runParser("-webkit-calc(100% - -webkit-calc(50% + 25px))")).toEqual(
      "-webkit-calc(50% - 25px)"
    );
  });

  test("should ignore calc with css variables (1)", () => {
    expect(runParser("calc(var(--mouseX) * 1px)"));
    //TODO: reference had no expected value
  });

  test("should ignore calc with css variables (2)", () => {
    expect(runParser("calc(10px - (100px * var(--mouseX)))")).toEqual(
      "calc(10px - 100px * var(--mouseX))"
    );
  });

  test("should ignore calc with css variables (3)", () => {
    expect(runParser("calc(10px - (100px + var(--mouseX)))")).toEqual(
      "calc(-90px - var(--mouseX))"
    );
  });

  test("should ignore calc with css variables (4)", () => {
    expect(runParser("calc(10px - (100px / var(--mouseX)))")).toEqual(
      "calc(10px - 100px / var(--mouseX))"
    );
  });

  test("should ignore calc with css variables (5)", () => {
    expect(runParser("calc(10px - (100px - var(--mouseX)))")).toEqual(
      "calc(-90px + var(--mouseX))"
    );
  });

  test("should ignore calc with css variables (6)", () => {
    expect(runParser("calc(var(--popupHeight) / 2)")).toEqual(
      "calc(var(--popupHeight) / 2)"
    );
  });

  test("should ignore calc with css variables (7)", () => {
    expect(
      runParser(
        "calc(var(--popupHeight, var(--defaultHeight, var(--height-150))) / 2)"
      )
    ).toEqual(
      "calc(var(--popupHeight, var(--defaultHeight, var(--height-150))) / 2)"
    );
  });

  test("should ignore calc with css variables (8)", () => {
    expect(
      runParser(
        "calc(var(--popupHeight, var(--defaultHeight, calc(100% - 50px))) / 2)"
      )
    ).toEqual(
      "calc(var(--popupHeight, var(--defaultHeight, calc(100% - 50px))) / 2)"
    );
  });

  test("should ignore calc with css variables (9)", () => {
    expect(
      runParser(
        "calc(var(--popupHeight, var(--defaultHeight, calc(100% - 50px + 25px))) / 2)"
      )
    ).toEqual(
      "calc(var(--popupHeight, var(--defaultHeight, calc(100% - 25px))) / 2)"
    );
  });

  test("should ignore calc with css variables (10)", () => {
    expect(
      runParser("calc(var(--popupHeight, var(--defaultHeight, 150px)) / 2)")
    ).toEqual("calc(var(--popupHeight, var(--defaultHeight, 150px)) / 2)");
  });

  test("should reduce calc with newline characters", () => {
    expect(runParser("calc(\n1rem \n* 2 \n* 1.5)")).toEqual("3rem");
  });

  test("should preserve calc with incompatible units", () => {
    expect(runParser("calc(100% + 1px)")).toEqual("calc(100% + 1px)");
  });

  test("should parse fractions without leading zero", () => {
    expect(runParser("calc(2rem - .14285em)")).toEqual(
      "calc(2rem - 0.14285em)"
    );
  });

  test("should handle precision correctly (1)", () => {
    expect(runParser("calc(1/100)")).toEqual("0.01");
  });

  test("should handle precision correctly (2)", () => {
    expect(runParser("calc(5/1000000)")).toEqual("0.00001");
  });

  //TODO: precision 6
  test("should handle precision correctly (3)", () => {
    expect(runParser("calc(5/1000000)")).toEqual("0.000005");
  });

  test("should reduce browser-prefixed calc (1)", () => {
    expect(runParser("-webkit-calc(1px + 1px)")).toEqual("2px");
  });

  test("should reduce browser-prefixed calc (2)", () => {
    expect(runParser("-moz-calc(1px + 1px)")).toEqual("2px");
  });

  test("should discard zero values (#2) (1)", () => {
    expect(runParser("calc(100vw / 2 - 6px + 0px)")).toEqual(
      "calc(50vw - 6px)"
    );
  });

  test("should discard zero values (#2) (2)", () => {
    expect(runParser("calc(500px - 0px)")).toEqual("500px");
  });

  //TODO: reduce-css-calc allows this, but it's not valid calc, so we throw
  test("should not perform addition on unitless values (#3)", () => {
    expect(() => runParser("calc(1px + 1)")).toThrow();
  });

  test("should reduce consecutive substractions (#24) (1)", () => {
    expect(runParser("calc(100% - 120px - 60px)")).toEqual(
      "calc(100% - 180px)"
    );
  });

  test("should reduce consecutive substractions (#24) (2)", () => {
    expect(runParser("calc(100% - 10px - 20px)")).toEqual("calc(100% - 30px)");
  });

  //TODO: precision 2
  test("should produce simpler result (postcss-calc#25) (1)", () => {
    expect(runParser("calc(14px + 6 * ((100vw - 320px) / 448))")).toEqual(
      "calc(9.71px + 1.34vw)"
    );
  });

  //TODO: precision 2
  test("should produce simpler result (postcss-calc#25) (2)", () => {
    expect(
      runParser("-webkit-calc(14px + 6 * ((100vw - 320px) / 448))")
    ).toEqual("-webkit-calc(9.71px + 1.34vw)");
  });

  test("should reduce mixed units of time (postcss-calc#33)", () => {
    expect(runParser("calc(1s - 50ms)")).toEqual("0.95s");
  });

  test("should correctly reduce calc with mixed units (cssnano#211)", () => {
    expect(runParser("bar:calc(99.99% * 1/1 - 0rem)")).toEqual("bar:99.99%");
  });

  test("should apply algebraic reduction (cssnano#319)", () => {
    expect(runParser("bar:calc((100px - 1em) + (-50px + 1em))")).toEqual(
      "bar:50px"
    );
  });

  test("should apply optimization (cssnano#320)", () => {
    expect(runParser("bar:calc(50% + (5em + 5%))")).toEqual(
      "bar:calc(55% + 5em)"
    );
  });

  test("should throw an exception when attempting to divide by zero", () => {
    // reduce-css-calc error message: 'Cannot divide by zero'
    expect(() => runParser("calc(500px/0)")).toThrow();
  });

  //TODO: While it is not standard behaviour, we do allow dividing by a unit, as long as the unit is balanced within multiplications and divisions
  test.skip("should throw an exception when attempting to divide by unit (#1)", () => {
    // reduce-css-calc error message: 'Cannot divide by "px", number expected'
    expect(() => runParser("calc(500px/2px)")).toThrow();
  });
  test("should throw an exception when a division by an unit remains", () => {
    // This test is not from reduce-css-calc
    expect(() => runParser("calc(500/2px)")).toThrow();
  });

  test("should reduce substraction from zero", () => {
    expect(runParser("calc( 0 - 10px)")).toEqual("-10px");
  });

  test("should reduce subtracted expression from zero", () => {
    expect(runParser("calc( 0 - calc(1px + 1em) )")).toEqual(
      "calc(-1em - 1px)"
    );
  });

  test("should reduce nested expression", () => {
    expect(runParser("calc( (1em - calc( 10px + 1em)) / 2)")).toEqual("-5px");
  });

  test("should skip constant()", () => {
    expect(runParser("calc(constant(safe-area-inset-left))")).toEqual(
      "calc(constant(safe-area-inset-left))"
    );
  });

  test("should skip env()", () => {
    expect(runParser("calc(env(safe-area-inset-left))")).toEqual(
      "calc(env(safe-area-inset-left))"
    );
  });

  test("should handle subtractions with different units", () => {
    expect(runParser("calc(100% - calc(666px + 1em + 2em + 100px))")).toEqual(
      "calc(100% - 3em - 766px)"
    );
  });
});
