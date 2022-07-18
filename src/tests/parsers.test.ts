import { parseCalc } from "../parseCalc";
import peggy from "peggy";
import fs from "fs";
import path from "path";

const grammar = fs.readFileSync(
  path.resolve(__dirname, "../parser/cssCalcParser.peggy"),
  "utf8"
);

const cssCalcParser = peggy.generate(grammar);

const runParser = (input: string) => {
  parseCalc(input, cssCalcParser.parse);
};

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

test("calc with var works", async () => {
  expect(runParser("calc(var(--toast)+7)")).toEqual("calc(7 + var(--toast))");
  expect(runParser("calc(0 - var(--toast))")).toEqual("calc(0 - var(--toast))");
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

test("min works", async () => {
  expect(runParser("min(1,4)")).toEqual("1");
  expect(runParser("min(4,1)")).toEqual("1");
  expect(runParser("min(6)")).toEqual("6");
  expect(runParser("min(8,7,9)")).toEqual("7");
  expect(runParser("min(44,44,44,44,44,44,44,44,44,44,44,44,44,9,44)")).toEqual(
    "9"
  );
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
  expect(runParser("max(44,44,44,44,44,44,44,44,44,44,44,44,44,9,44)")).toEqual(
    "44"
  );
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
  expect(runParser("clamp(var(--toast),var(--toastA),var(--toastB))")).toEqual(
    "clamp(var(--toast),var(--toastA),var(--toastB))"
  );
});

test("clamp works with variables and calc", async () => {
  expect(runParser("clamp(0, calc( 1 * var(--test) ), 1 )")).toEqual(
    "clamp(0,1,var(--test))"
  );
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
  expect(runParser("min(44,44,44,44,44,44,44,44,44,44,44,44,44,9,44)")).toEqual(
    "9"
  );
  expect(runParser("min(1,2,3,4,-99)")).toEqual("-99");
  expect(() => runParser("min()")).toThrow();
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
  // This should also work, but does not yet
  // expect(
  //   runParser("min(3px,3rem,max(3rem, 3px, var(--test)),var(--test))")
  // ).toEqual("min(3px,3rem,max(3rem, 3px, var(--test)))");
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
