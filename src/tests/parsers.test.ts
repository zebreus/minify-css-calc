import { parseCalc } from "../parseCalc";

test("empty string is not valid", async () => {
  expect(() => parseCalc("")).toThrow();
  expect(() => parseCalc("calc()")).toThrow();
});

test("only numbers are valid", async () => {
  expect(parseCalc("2")).toEqual("2");
  expect(parseCalc(".9")).toEqual("0.9");
  expect(parseCalc("-10")).toEqual("-10");
  expect(parseCalc("+10")).toEqual("10");
});

test("toplevel expressions are not valid", async () => {
  expect(() => parseCalc("5+10")).toThrow();
  expect(() => parseCalc("5-10")).toThrow();
  expect(() => parseCalc("5/10")).toThrow();
  expect(() => parseCalc("5*10")).toThrow();
  expect(() => parseCalc("(10)")).toThrow();
});

test("supports integers", async () => {
  expect(parseCalc("calc(4)")).toEqual("4");
  expect(parseCalc("calc(0)")).toEqual("0");
  expect(parseCalc("calc(0077)")).toEqual("77");
  expect(parseCalc("calc(-999)")).toEqual("-999");
});

test("supports floats", async () => {
  expect(parseCalc("calc(0.823593)")).toEqual("0.823593");
  expect(parseCalc("calc(.984938)")).toEqual("0.984938");
  expect(parseCalc("calc(9897.32894)")).toEqual("9897.32894");
  expect(parseCalc("calc(-9897.32894)")).toEqual("-9897.32894");
  expect(() => parseCalc("calc(56.)")).toThrow();
});

test("basic calc works as expected", async () => {
  expect(parseCalc("calc(4)")).toEqual("4");
});

test("brackets work", async () => {
  expect(parseCalc("calc(((4)))")).toEqual("4");
});

test("basic integer arithmetic works", async () => {
  expect(parseCalc("calc(4+5)")).toEqual("9");
  expect(parseCalc("calc(5-4)")).toEqual("1");
  expect(parseCalc("calc(4-5)")).toEqual("-1");
  expect(parseCalc("calc(20/5)")).toEqual("4");
  expect(parseCalc("calc(4*64)")).toEqual("256");
});

test("order is correct", async () => {
  expect(parseCalc("calc(4+2*3)")).toEqual("10");
  expect(parseCalc("calc(4+12/2)")).toEqual("10");
  expect(parseCalc("calc(4*2+3)")).toEqual("11");
});

test("nested calc works", async () => {
  expect(parseCalc("calc(calc(4))")).toEqual("4");
  expect(parseCalc("calc(4*calc(4)+4)")).toEqual("20");
  expect(parseCalc("calc(calc(calc(calc(4)))*calc(4))")).toEqual("16");
});

test("var works", async () => {
  expect(parseCalc("var(--toast)")).toEqual("var(--toast)");
});

test("calc with var works", async () => {
  expect(parseCalc("calc(var(--toast)+7)")).toEqual("calc(7 + var(--toast))");
  expect(parseCalc("calc(0 - var(--toast))")).toEqual("calc(0 - var(--toast))");
  expect(parseCalc("calc(0 - var(--toast) + var(--toastB))")).toEqual(
    "calc(var(--toastB) - var(--toast))"
  );

  expect(parseCalc("calc(0 - var(--toast) - var(--toastB))")).toEqual(
    "calc(0 - var(--toast) - var(--toastB))"
  );
  expect(parseCalc("calc(4+var(--toast)+8+2-5*4)")).toEqual(
    "calc(var(--toast) - 6)"
  );
});

test("addition with negative values does not add a zero to the beginning", async () => {
  expect(parseCalc("calc(0 - 7 - var(--toast))")).toEqual(
    "calc(-7 - var(--toast))"
  );
});

test("nested calc with vars work", async () => {
  expect(parseCalc("calc(calc(var(--test)))")).toEqual("var(--test)");
  expect(parseCalc("calc(4*calc(var(--test) + 1)+4)")).toEqual(
    "calc(4*var(--test) + 8)"
  );
  expect(parseCalc("calc(calc(calc(calc(var(--test))))*calc(4))")).toEqual(
    "calc(4*var(--test))"
  );
});

test("identity addition with var works", async () => {
  expect(parseCalc("calc( 1 + var(--test) -1 )")).toEqual("var(--test)");
  expect(parseCalc("calc( 0 + 0 - 0 + var(--test) + 0 - 0 )")).toEqual(
    "var(--test)"
  );
  expect(parseCalc("calc( 15 + var(--test) - 5 + 3 - 13 )")).toEqual(
    "var(--test)"
  );
  expect(parseCalc("calc( 1 - 1 + var(--test) )")).toEqual("var(--test)");
});

test("calc multiplication of var with one works", async () => {
  expect(parseCalc("calc( 1 * var(--test) )")).toEqual("var(--test)");
  expect(parseCalc("calc( 1 * 1 * var(--test) )")).toEqual("var(--test)");
  expect(parseCalc("calc( var(--test) * 1 )")).toEqual("var(--test)");
  expect(parseCalc("calc( -1 * var(--test) * -1 )")).toEqual("var(--test)");
});

test("calc in calc gets removed", async () => {
  expect(
    parseCalc("calc(var(--toast) + calc(var(--tast)) - min(var(--test)) )")
  ).toEqual("calc(var(--tast) + var(--toast) - var(--test))");

  expect(
    parseCalc("calc(var(--toast) + calc(var(--tast)) - min(var(--tast)) )")
  ).toEqual("var(--toast)");
});

test("calc with a single other expression gets removed", async () => {
  expect(
    parseCalc("calc(var(--toast) + min(calc(calc(var(--tast)))) )")
  ).toEqual("calc(var(--tast) + var(--toast))");
});

test("min works", async () => {
  expect(parseCalc("min(1,4)")).toEqual("1");
  expect(parseCalc("min(4,1)")).toEqual("1");
  expect(parseCalc("min(6)")).toEqual("6");
  expect(parseCalc("min(8,7,9)")).toEqual("7");
  expect(parseCalc("min(44,44,44,44,44,44,44,44,44,44,44,44,44,9,44)")).toEqual(
    "9"
  );
  expect(parseCalc("min(1,2,3,4,-99)")).toEqual("-99");
  expect(() => parseCalc("min()")).toThrow();
});

test("min works with variables", async () => {
  expect(parseCalc("min(var(--toast))")).toEqual("var(--toast)");
  expect(parseCalc("min(var(--toast), var(--toastB))")).toEqual(
    "min(var(--toast),var(--toastB))"
  );
  expect(parseCalc("min(1,4,var(--toast))")).toEqual("min(1,var(--toast))");
});

test("max works with variables", async () => {
  expect(parseCalc("max(var(--toast))")).toEqual("var(--toast)");
  expect(parseCalc("max(var(--toast), var(--toastB))")).toEqual(
    "max(var(--toast),var(--toastB))"
  );
  expect(parseCalc("max(1,4,var(--toast))")).toEqual("max(4,var(--toast))");
});

test("max works", async () => {
  expect(parseCalc("max(1,4)")).toEqual("4");
  expect(parseCalc("max(4,1)")).toEqual("4");
  expect(parseCalc("max(6)")).toEqual("6");
  expect(parseCalc("max(8,7,9)")).toEqual("9");
  expect(parseCalc("max(44,44,44,44,44,44,44,44,44,44,44,44,44,9,44)")).toEqual(
    "44"
  );
  expect(
    parseCalc("max(44,44,44,44,44,44,44,44,44,44,44,44,44,99,44)")
  ).toEqual("99");
  expect(parseCalc("max(1,2,3,4,-99)")).toEqual("4");
  expect(parseCalc("max(-1,-2,-3,-4,99)")).toEqual("99");
  expect(() => parseCalc("max()")).toThrow();
});

test("clamp works", async () => {
  expect(parseCalc("clamp(3,4,5)")).toEqual("4");
  expect(parseCalc("clamp(1,9,4)")).toEqual("4");
  expect(parseCalc("clamp(-5,29,-3)")).toEqual("-3");
  expect(() => parseCalc("clamp()")).toThrow();
  expect(() => parseCalc("clamp(1)")).toThrow();
  expect(() => parseCalc("clamp(1,2)")).toThrow();
  expect(() => parseCalc("clamp(1,2,3,4)")).toThrow();
});

test("clamps prefers minimum over maximum", async () => {
  expect(parseCalc("clamp(10,8,5)")).toEqual("10");
  expect(parseCalc("clamp(10,3,5)")).toEqual("10");
  expect(parseCalc("clamp(10,12,5)")).toEqual("10");
});

test("clamp works with variables", async () => {
  expect(parseCalc("clamp(1,4,var(--toast))")).toEqual(
    "clamp(1,4,var(--toast))"
  );
  expect(parseCalc("clamp(4,4,var(--toast))")).toEqual("4");
  expect(parseCalc("clamp(4,1,var(--toast))")).toEqual("4");
  expect(parseCalc("clamp(var(--toast),1,4)")).toEqual("max(1,var(--toast))");
  expect(parseCalc("clamp(var(--toast),1,1)")).toEqual("max(1,var(--toast))");
  expect(parseCalc("clamp(var(--toast),4,1)")).toEqual("max(1,var(--toast))");
  expect(parseCalc("clamp(1,var(--toast),4)")).toEqual(
    "clamp(1,4,var(--toast))"
  );
  expect(parseCalc("clamp(4,var(--toast),4)")).toEqual("4");
  expect(parseCalc("clamp(4,var(--toast),1)")).toEqual("4");
  expect(parseCalc("clamp(var(--toastA),4,var(--toast))")).toEqual(
    "clamp(var(--toastA),4,var(--toast))"
  );
  expect(parseCalc("clamp(4,var(--toastA),var(--toast))")).toEqual(
    "clamp(4,var(--toast),var(--toastA))"
  );
  expect(parseCalc("clamp(var(--toast),var(--toastA),4)")).toEqual(
    "clamp(var(--toast),4,var(--toastA))"
  );
  expect(parseCalc("clamp(var(--toast),var(--toastA),var(--toastB))")).toEqual(
    "clamp(var(--toast),var(--toastA),var(--toastB))"
  );
});

test("clamp works with variables and calc", async () => {
  expect(parseCalc("clamp(0, calc( 1 * var(--test) ), 1 )")).toEqual(
    "clamp(0,1,var(--test))"
  );
});

test("calc is required in expressiosn", async () => {
  expect(() => parseCalc("min(5-3)")).toThrow();
  expect(() => parseCalc("min(calc(5-3))")).not.toThrow();
  expect(() => parseCalc("max(5-3)")).toThrow();
  expect(() => parseCalc("max(calc(5-3))")).not.toThrow();
  expect(() => parseCalc("clamp(0,5-3,6)")).toThrow();
  expect(() => parseCalc("clamp(0,calc(5-3),6)")).not.toThrow();
  expect(() => parseCalc("clamp(5-3,0,6)")).toThrow();
  expect(() => parseCalc("clamp(calc(5-3),0,6)")).not.toThrow();
  expect(() => parseCalc("clamp(0,0,5-3)")).toThrow();
  expect(() => parseCalc("clamp(0,0,calc(5-3))")).not.toThrow();
});

test("extra test", async () => {
  expect(parseCalc("min(1,4)")).toEqual("1");
  expect(parseCalc("min(4,1)")).toEqual("1");
  expect(parseCalc("min(6)")).toEqual("6");
  expect(parseCalc("min(8,7,9)")).toEqual("7");
  expect(parseCalc("min(44,44,44,44,44,44,44,44,44,44,44,44,44,9,44)")).toEqual(
    "9"
  );
  expect(parseCalc("min(1,2,3,4,-99)")).toEqual("-99");
  expect(() => parseCalc("min()")).toThrow();
});

test("simple nested min and max", async () => {
  expect(parseCalc("max(1,2)")).toEqual("2");
  expect(parseCalc("min(3,max(1,2))")).toEqual("2");
  expect(parseCalc("min(3,max(1,2,var(--test)))")).toEqual(
    "min(3,max(2,var(--test)))"
  );
});

test("complex nested min and max", async () => {
  expect(parseCalc("min(3,max(3,var(--test)))")).toEqual("3"); // "min(3,max(2,var(--test)))"
  expect(parseCalc("min(3px,3rem,max(3rem, 3px, var(--test)))")).toEqual(
    "min(3px,3rem)"
  );
  // This should also work, but does not yet
  // expect(
  //   parseCalc("min(3px,3rem,max(3rem, 3px, var(--test)),var(--test))")
  // ).toEqual("min(3px,3rem,max(3rem, 3px, var(--test)))");
});

test("nested min and max get integrated", async () => {
  expect(parseCalc("min(min(3))")).toEqual("3");
  expect(parseCalc("min(3em,min(3px,var(--test)))")).toEqual(
    "min(3em,3px,var(--test))"
  );
  expect(parseCalc("min(3em,min(3px,max(var(--test), 3em)))")).toEqual(
    "min(3em,3px)"
  );
});

test("valid additions dont throw", async () => {
  expect(() => parseCalc("calc(3px + 5px)")).not.toThrow();
  expect(() => parseCalc("calc(3px + 5rem)")).not.toThrow();
  expect(() => parseCalc("calc(3deg + 5turn)")).not.toThrow();
  expect(() => parseCalc("calc(3x + 5dpi)")).not.toThrow();
});

test("invalid addition throws", async () => {
  expect(() => parseCalc("calc(3px + 5)")).toThrow();
  expect(() => parseCalc("calc(3rem + 5)")).toThrow();
  expect(() => parseCalc("calc(3x + 5)")).toThrow();
  expect(() => parseCalc("calc(3ms + 5)")).toThrow();
  expect(() => parseCalc("calc(3deg + 5)")).toThrow();
});

test("valid multiplications dont throw", async () => {
  expect(() => parseCalc("calc(3px * 5)")).not.toThrow();
  expect(() => parseCalc("calc(3px * 5 * 10)")).not.toThrow();
  expect(() => parseCalc("calc(5 * 3deg * 5)")).not.toThrow();
  expect(() => parseCalc("calc(5 * 5)")).not.toThrow();
  expect(() => parseCalc("calc(5 * 0)")).not.toThrow();
});

test("invalid multiplications throws", async () => {
  expect(() => parseCalc("calc(3px * 5px)")).toThrow();
  expect(() => parseCalc("calc(3rem * 5px)")).toThrow();
  expect(() => parseCalc("calc(3x * 5deg)")).toThrow();
  expect(() => parseCalc("calc(3ms * 5s)")).toThrow();
  expect(() => parseCalc("calc(3deg * 17 * 3deg)")).toThrow();
  expect(() => parseCalc("calc(3deg * 0 * 3deg)")).toThrow();
});

test("calc resolves complex equations", async () => {
  // expect(parseCalc("calc(calc(var(--test)))")).toEqual("var(--test)");
  expect(parseCalc("calc(4*(var(--test) + 1))")).toEqual(
    "calc(4 + 4*var(--test))"
    // "calc((1 + var(--test))*4)"
  );

  expect(parseCalc("calc(4*(var(--test) + (2*var(--toast))))")).toEqual(
    // "calc(4*var(--test) + 4*(2*var(--toast)))"
    "calc(4*var(--test) + 8*var(--toast))"
    // "calc(4*(var(--test) + 1))"
  );
  expect(parseCalc("calc(var(--test) + var(--test))")).toEqual(
    "calc(2*var(--test))"
  );
});

test("multiplications get expanded", async () => {
  expect(parseCalc("calc((var(--a)+var(--b))*(2))")).toEqual(
    "calc(2*var(--a) + 2*var(--b))"
  );
  expect(parseCalc("calc((var(--a)+var(--b))/(2))")).toEqual(
    "calc(0.5*var(--a) + 0.5*var(--b))"
  );
});

test("multiplication normalization and deduplication works", async () => {
  expect(parseCalc("calc(var(--test)*var(--test)*2)")).toEqual(
    "calc(2*var(--test)*var(--test))"
  );
  expect(parseCalc("calc(var(--test)/var(--test)*2)")).toEqual("2");
});

test("duplicate values in additions are converted to multiplications", async () => {
  expect(parseCalc("calc(var(--a) + var(--a) + 2)")).toEqual(
    "calc(2 + 2*var(--a))"
  );
  expect(parseCalc("calc(var(--a) + 2*var(--a) + 2)")).toEqual(
    "calc(2 + 3*var(--a))"
  );
});

test("testextra", async () => {
  // expect(parseCalc("calc((var(--toast)*2)*4 + 8)")).toEqual("2");

  expect(parseCalc("calc((var(--toast)*2 + 2)*4)")).toEqual(
    "calc(8 + 8*var(--toast))"
  );
  expect(parseCalc("calc((var(--a)*var(--b))/(var(--c)+var(--d)))")).toEqual(
    "calc(var(--a)*var(--b)/(var(--c) + var(--d)))"
  );
  //expect(parseCalc("calc(var(--test)/var(--test)*2)")).toEqual("2");
});
