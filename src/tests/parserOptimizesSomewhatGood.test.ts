import { runParser } from "./runParser";

describe("parser does do some good/complex optimizations", () => {
  test("calc with var works", async () => {
    expect(runParser("calc(var(--toast)+7)")).toEqual("calc(7 + var(--toast))");
    expect(runParser("calc(0 - var(--toast))")).toEqual(
      "calc(0 - var(--toast))"
    );
    expect(runParser("calc(0 - var(--toast) + var(--toastB))")).toEqual(
      "calc(var(--toastB) - var(--toast))"
    );

    expect(runParser("calc(0 - var(--toast) - var(--toastB))")).toEqual(
      "calc(0 - var(--toast) - var(--toastB))"
    );
    expect(runParser("calc(4+var(--toast)+8+2-5*4)")).toEqual(
      "calc(var(--toast) - 6)"
    );
  });

  test("addition with negative values does not add a zero to the beginning", async () => {
    expect(runParser("calc(0 - 7 - var(--toast))")).toEqual(
      "calc(-7 - var(--toast))"
    );
  });

  test("nested calc with vars work", async () => {
    expect(runParser("calc(calc(var(--test)))")).toEqual("var(--test)");
    expect(runParser("calc(4*calc(var(--test) + 1)+4)")).toEqual(
      "calc(4*var(--test) + 8)"
    );
    expect(runParser("calc(calc(calc(calc(var(--test))))*calc(4))")).toEqual(
      "calc(4*var(--test))"
    );
  });

  test("identity addition with var works", async () => {
    expect(runParser("calc( 1 + var(--test) -1 )")).toEqual("var(--test)");
    expect(runParser("calc( 0 + 0 - 0 + var(--test) + 0 - 0 )")).toEqual(
      "var(--test)"
    );
    expect(runParser("calc( 15 + var(--test) - 5 + 3 - 13 )")).toEqual(
      "var(--test)"
    );
    expect(runParser("calc( 1 - 1 + var(--test) )")).toEqual("var(--test)");
  });

  test("calc multiplication of var with one works", async () => {
    expect(runParser("calc( 1 * var(--test) )")).toEqual("var(--test)");
    expect(runParser("calc( 1 * 1 * var(--test) )")).toEqual("var(--test)");
    expect(runParser("calc( var(--test) * 1 )")).toEqual("var(--test)");
    expect(runParser("calc( -1 * var(--test) * -1 )")).toEqual("var(--test)");
  });

  test("calc in calc gets removed", async () => {
    expect(
      runParser("calc(var(--toast) + calc(var(--tast)) - min(var(--test)) )")
    ).toEqual("calc(var(--tast) + var(--toast) - var(--test))");

    expect(
      runParser("calc(var(--toast) + calc(var(--tast)) - min(var(--tast)) )")
    ).toEqual("var(--toast)");
  });

  test("calc with a single other expression gets removed", async () => {
    expect(
      runParser("calc(var(--toast) + min(calc(calc(var(--tast)))) )")
    ).toEqual("calc(var(--tast) + var(--toast))");
  });

  test("calc resolves complex equations", async () => {
    // expect(runParser("calc(calc(var(--test)))")).toEqual("var(--test)");
    expect(runParser("calc(4*(var(--test) + 1))")).toEqual(
      "calc(4 + 4*var(--test))"
      // "calc((1 + var(--test))*4)"
    );

    expect(runParser("calc(4*(var(--test) + (2*var(--toast))))")).toEqual(
      // "calc(4*var(--test) + 4*(2*var(--toast)))"
      "calc(4*var(--test) + 8*var(--toast))"
      // "calc(4*(var(--test) + 1))"
    );
    expect(runParser("calc(var(--test) + var(--test))")).toEqual(
      "calc(2*var(--test))"
    );
  });

  test("multiplications get expanded", async () => {
    expect(runParser("calc((var(--a)+var(--b))*(2))")).toEqual(
      "calc(2*var(--a) + 2*var(--b))"
    );
    expect(runParser("calc((var(--a)+var(--b))/(2))")).toEqual(
      "calc(0.5*var(--a) + 0.5*var(--b))"
    );
  });

  test("multiplication normalization and deduplication works", async () => {
    expect(runParser("calc(var(--test)*var(--test)*2)")).toEqual(
      "calc(2*var(--test)*var(--test))"
    );
    expect(runParser("calc(var(--test)/var(--test)*2)")).toEqual("2");
  });

  test("duplicate values in additions are converted to multiplications", async () => {
    expect(runParser("calc(var(--a) + var(--a) + 2)")).toEqual(
      "calc(2 + 2*var(--a))"
    );
    expect(runParser("calc(var(--a) + 2*var(--a) + 2)")).toEqual(
      "calc(2 + 3*var(--a))"
    );
  });

  test("testextra", async () => {
    // expect(runParser("calc((var(--toast)*2)*4 + 8)")).toEqual("2");

    expect(runParser("calc((var(--toast)*2 + 2)*4)")).toEqual(
      "calc(8 + 8*var(--toast))"
    );
    expect(runParser("calc((var(--a)*var(--b))/(var(--c)+var(--d)))")).toEqual(
      "calc(var(--a)*var(--b)/(var(--c) + var(--d)))"
    );
    //expect(runParser("calc(var(--test)/var(--test)*2)")).toEqual("2");
  });
});
