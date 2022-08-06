import Big from "big.js";
import { stringifyNode } from "../stringifyNode";

describe("stringifyNode works as expected", () => {
  test("basic stringify test works", async () => {
    expect(
      stringifyNode({ type: "value", value: Big(1), unit: "number" })
    ).toEqual("1");
    expect(stringifyNode({ type: "value", value: Big(1), unit: "px" })).toEqual(
      "1px"
    );
  });

  test("0 values get stringified independent of the unit", async () => {
    expect(
      stringifyNode({ type: "value", value: Big(0), unit: "number" })
    ).toEqual("0");
    expect(stringifyNode({ type: "value", value: Big(0), unit: "px" })).toEqual(
      "0"
    );
    expect(
      stringifyNode({ type: "value", value: Big(0), unit: "var(--toaster)" })
    ).toEqual("0");
    expect(
      stringifyNode({ type: "value", value: Big(0), unit: "dsfsafdwe" })
    ).toEqual("0");
  });

  test("unit values get stringified", async () => {
    expect(stringifyNode({ type: "value", value: Big(0), unit: "px" })).toEqual(
      "0"
    );
    expect(stringifyNode({ type: "value", value: Big(2), unit: "px" })).toEqual(
      "2px"
    );
    expect(stringifyNode({ type: "value", value: Big(1), unit: "px" })).toEqual(
      "1px"
    );
    expect(stringifyNode({ type: "value", value: Big(0), unit: "%" })).toEqual(
      "0"
    );
    expect(stringifyNode({ type: "value", value: Big(2), unit: "%" })).toEqual(
      "2%"
    );
    expect(stringifyNode({ type: "value", value: Big(1), unit: "%" })).toEqual(
      "1%"
    );
  });

  test("var values get stringified", async () => {
    expect(
      stringifyNode({
        type: "var",
        value: "var(--test)",
        values: {},
      })
    ).toEqual("var(--test)");
  });

  test("nested notes in var values get optimized", async () => {
    expect(
      stringifyNode({
        type: "var",
        value: "var(--test, calc(2px + 2px))",
        values: {
          ["calc(2px + 2px)"]: {
            type: "calc",
            value: {
              type: "addition",
              values: [
                {
                  operation: "+",
                  value: { type: "value", value: Big(2), unit: "px" },
                },
                {
                  operation: "+",
                  value: { type: "value", value: Big(2), unit: "px" },
                },
              ],
            },
          },
        },
      })
    ).toEqual("var(--test, calc(2px + 2px))");
    expect(
      stringifyNode({
        type: "var",
        value: "var(--test, calc(2px + 2px))",
        values: {
          ["calc(2px + 2px)"]: { type: "value", value: Big(4), unit: "px" },
        },
      })
    ).toEqual("var(--test, 4px)");
  });

  test("max get stringified", async () => {
    expect(
      stringifyNode({
        type: "max",
        values: [],
      })
    ).toEqual("max()");
    expect(
      stringifyNode({
        type: "max",
        values: [{ type: "value", value: Big(1), unit: "number" }],
      })
    ).toEqual("max(1)");
    expect(
      stringifyNode({
        type: "max",
        values: [
          { type: "value", value: Big(1), unit: "number" },
          { type: "value", value: Big(2), unit: "px" },
        ],
      })
    ).toEqual("max(1,2px)");
  });

  test("min get stringified", async () => {
    expect(
      stringifyNode({
        type: "min",
        values: [],
      })
    ).toEqual("min()");
    expect(
      stringifyNode({
        type: "min",
        values: [{ type: "value", value: Big(1), unit: "number" }],
      })
    ).toEqual("min(1)");
    expect(
      stringifyNode({
        type: "min",
        values: [
          { type: "value", value: Big(1), unit: "number" },
          { type: "value", value: Big(2), unit: "px" },
        ],
      })
    ).toEqual("min(1,2px)");
  });

  test("clamp gets stringified", async () => {
    expect(
      stringifyNode({
        type: "min",
        values: [],
      })
    ).toEqual("min()");
    expect(
      stringifyNode({
        type: "min",
        values: [{ type: "value", value: Big(1), unit: "number" }],
      })
    ).toEqual("min(1)");
    expect(
      stringifyNode({
        type: "clamp",
        min: { type: "value", value: Big(1), unit: "number" },
        value: { type: "value", value: Big(1), unit: "number" },
        max: { type: "value", value: Big(1), unit: "number" },
      })
    ).toEqual("clamp(1,1,1)");
  });

  test("addition get stringified", async () => {
    expect(
      stringifyNode({
        type: "addition",
        values: [],
      })
    ).toEqual("0");
    expect(
      stringifyNode({
        type: "addition",
        values: [
          {
            operation: "+",
            value: { type: "value", value: Big(1), unit: "number" },
          },
        ],
      })
    ).toEqual("1");
    expect(
      stringifyNode({
        type: "addition",
        values: [
          {
            operation: "+",
            value: { type: "value", value: Big(1), unit: "number" },
          },
          {
            operation: "+",
            value: { type: "value", value: Big(3), unit: "number" },
          },
          {
            operation: "+",
            value: { type: "value", value: Big(3), unit: "px" },
          },
        ],
      })
    ).toEqual("1 + 3 + 3px");
  });

  test("subtraction get stringified", async () => {
    expect(
      stringifyNode({
        type: "addition",
        values: [
          {
            operation: "-",
            value: { type: "value", value: Big(1), unit: "number" },
          },
        ],
      })
    ).toEqual("0 - 1");
    expect(
      stringifyNode({
        type: "addition",
        values: [
          {
            operation: "+",
            value: { type: "value", value: Big(1), unit: "number" },
          },
          {
            operation: "-",
            value: { type: "value", value: Big(3), unit: "number" },
          },
          {
            operation: "+",
            value: { type: "value", value: Big(3), unit: "px" },
          },
        ],
      })
    ).toEqual("1 + 3px - 3");
  });

  test("multiplication gets stringified", async () => {
    expect(() =>
      stringifyNode({
        type: "multiplication",
        values: [],
      })
    ).toThrow();
    expect(
      stringifyNode({
        type: "multiplication",
        values: [
          {
            operation: "*",
            value: { type: "value", value: Big(1), unit: "number" },
          },
        ],
      })
    ).toEqual("1");
    expect(
      stringifyNode({
        type: "multiplication",
        values: [
          {
            operation: "*",
            value: { type: "value", value: Big(1), unit: "number" },
          },
          {
            operation: "*",
            value: { type: "value", value: Big(3), unit: "number" },
          },
          {
            operation: "*",
            value: { type: "value", value: Big(3), unit: "px" },
          },
        ],
      })
    ).toEqual("1*3*3px");
  });

  test("divisision gets stringified", async () => {
    expect(
      stringifyNode({
        type: "multiplication",
        values: [
          {
            operation: "/",
            value: { type: "value", value: Big(1), unit: "number" },
          },
        ],
      })
    ).toEqual("1/1");
    expect(
      stringifyNode({
        type: "multiplication",
        values: [
          {
            operation: "*",
            value: { type: "value", value: Big(1), unit: "number" },
          },
          {
            operation: "/",
            value: { type: "value", value: Big(3), unit: "number" },
          },
          {
            operation: "*",
            value: { type: "value", value: Big(3), unit: "px" },
          },
        ],
      })
    ).toEqual("1*3px/3");
  });

  test("parenthesis get stringified", async () => {
    expect(
      stringifyNode({
        type: "parenthesis",
        value: { type: "value", value: Big(1), unit: "number" },
      })
    ).toEqual("(1)");
  });

  test("calc get stringified", async () => {
    expect(
      stringifyNode({
        type: "calc",
        value: { type: "value", value: Big(1), unit: "number" },
      })
    ).toEqual("calc(1)");
  });
});
