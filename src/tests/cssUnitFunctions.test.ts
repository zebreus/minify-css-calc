import { compareValues } from "../cssUnitFunctions";

test("comparing numbers works", async () => {
  expect(
    compareValues({ value: 1, unit: "number" }, { value: 2, unit: "number" })
  ).toEqual(-1);
  expect(
    compareValues({ value: 2, unit: "number" }, { value: 1, unit: "number" })
  ).toEqual(1);
  expect(
    compareValues({ value: 2, unit: "number" }, { value: 2, unit: "number" })
  ).toEqual(0);
});

test("comparing numbers with integers works", async () => {
  expect(
    compareValues({ value: 1, unit: "integer" }, { value: 2, unit: "number" })
  ).toEqual(-1);
  expect(
    compareValues({ value: 2, unit: "integer" }, { value: 1, unit: "number" })
  ).toEqual(1);
  expect(
    compareValues({ value: 2, unit: "integer" }, { value: 2, unit: "number" })
  ).toEqual(0);
});

test("comparing angles works", async () => {
  expect(
    compareValues({ value: 1, unit: "deg" }, { value: 2, unit: "deg" })
  ).toEqual(-1);
  expect(
    compareValues({ value: 2, unit: "deg" }, { value: 1, unit: "deg" })
  ).toEqual(1);
  expect(
    compareValues({ value: 2, unit: "deg" }, { value: 2, unit: "deg" })
  ).toEqual(0);

  expect(
    compareValues({ value: 0, unit: "number" }, { value: 2, unit: "deg" })
  ).toEqual(-1);
});

test("comparing angles in different units works", async () => {
  expect(
    compareValues({ value: 1, unit: "turn" }, { value: 370, unit: "deg" })
  ).toEqual(-1);
  expect(
    compareValues({ value: 1, unit: "turn" }, { value: 180, unit: "deg" })
  ).toEqual(1);
  expect(
    compareValues({ value: 1, unit: "turn" }, { value: 360, unit: "deg" })
  ).toEqual(0);
});

test("comparing absolute lengths works", async () => {
  expect(
    compareValues({ value: 1, unit: "px" }, { value: 2, unit: "px" })
  ).toEqual(-1);
  expect(
    compareValues({ value: 2, unit: "px" }, { value: 1, unit: "px" })
  ).toEqual(1);
  expect(
    compareValues({ value: 2, unit: "px" }, { value: 2, unit: "px" })
  ).toEqual(0);
});

test("comparing absolute lengths with different units works", async () => {
  expect(
    compareValues({ value: 1, unit: "cm" }, { value: 1, unit: "in" })
  ).toEqual(-1);
  expect(
    compareValues({ value: 3, unit: "cm" }, { value: 1, unit: "in" })
  ).toEqual(1);
  expect(
    compareValues({ value: 2.54, unit: "cm" }, { value: 1, unit: "in" })
  ).toEqual(0);
});

test("comparing uncomparable and incompatible things throws", async () => {
  expect(() =>
    compareValues({ value: 1, unit: "cm" }, { value: 1, unit: "deg" })
  ).toThrow();
});

test("comparing compatible but uncomparable things returns undefined", async () => {
  expect(
    compareValues({ value: 1, unit: "cm" }, { value: 1, unit: "rem" })
  ).toEqual(undefined);
});

test("comparing viewport relative lengths detects that vmin is always smaller or equal then vmax", async () => {
  expect(
    compareValues({ value: 0.9, unit: "vmin" }, { value: 1, unit: "vmax" })
  ).toEqual(-1);
  expect(
    compareValues({ value: 1.0, unit: "vmax" }, { value: 0.9, unit: "vmin" })
  ).toEqual(1);
});

test("comparing viewport relative lengths do not assume, that vmin is smaller then vmax (they can be equal)", async () => {
  expect(
    compareValues({ value: 1, unit: "vmin" }, { value: 1, unit: "vmax" })
  ).toEqual(undefined);
  expect(
    compareValues({ value: 1, unit: "vmax" }, { value: 1, unit: "vmin" })
  ).toEqual(undefined);
  expect(
    compareValues({ value: 0.9, unit: "vmax" }, { value: 1, unit: "vmin" })
  ).toEqual(undefined);
});
