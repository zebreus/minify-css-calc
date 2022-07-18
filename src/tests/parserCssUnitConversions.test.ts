import { runParser } from "./runParser";

describe("parser knows about units", () => {
  test("fails on unknown units", async () => {
    expect(() => runParser("5jdnfgjfdng")).toThrow();
  });

  test("knows about absolute length units", async () => {
    expect(runParser("1cm")).toEqual("37.79528px");
    expect(runParser("1px")).toEqual("1px");
    expect(runParser("1mm")).toEqual("3.77953px");
    expect(runParser("1Q")).toEqual("0.94488px");
    expect(runParser("1in")).toEqual("96px");
    expect(runParser("1pc")).toEqual("16px");
    expect(runParser("1pt")).toEqual("1.33333px");
  });
});
