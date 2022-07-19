export function includes<T extends U, U>(
  coll: ReadonlyArray<T>,
  el: U
): el is T {
  return coll.includes(el as T);
}

export const absoluteLengthUnits = [
  "cm",
  "mm",
  "Q",
  "in",
  "pc",
  "pt",
  "px",
] as const;
export type AbsoluteLengthUnit = typeof absoluteLengthUnits[number];

export const fontRelativeLengthUnits = [
  "em",
  "rem",
  "ex",
  "rex",
  "cap",
  "rcap",
  "ch",
  "rch",
  "ic",
  "ric",
  "lh",
  "rlh",
] as const;

export const viewportPercentageLengthUnits = [
  "vw", // Always between svw and lvw
  "vh", // Always between svh and lvh
  "vi",
  "vb",
  "vmin", // Always smaller or equal to vh and vw
  "vmax", // Always larger or equal to vh and vw
  "dvw",
  "dvh",
  "dvi",
  "dvb",
  "dvmin",
  "dvmax",
  "lvw", // Always larger or equal to vw, dvw and lvw
  "lvh", // Always larger or equal to vh, dvh and lvh
  "lvi",
  "lvb",
  "lvmin",
  "lvmax",
  "svw", // Always smaller or equal to vw, dvw and lvw
  "svh", // Always smaller or equal to vh, dvh and lvh
  "svi",
  "svb",
  "svmin",
  "svmax",
] as const;
export type ViewportPercentageLengthUnit =
  typeof viewportPercentageLengthUnits[number];

export const relativeLengthUnits = [
  ...fontRelativeLengthUnits,
  ...viewportPercentageLengthUnits,
] as const;
export type RelativeLengthUnit = typeof relativeLengthUnits[number];

export const lengthUnits = [
  ...absoluteLengthUnits,
  ...relativeLengthUnits,
] as const;
export type LengthUnit = typeof lengthUnits[number];

export const integerUnits = ["integer"] as const;
export type IntegerUnit = typeof numberUnits[number];

export const numberUnits = ["number"] as const;
export type NumberUnit = typeof numberUnits[number];

export const percentageUnits = ["%"] as const;
export type PercentageUnit = typeof percentageUnits[number];

export const angleUnits = ["deg", "grad", "rad", "turn"] as const;
export type AngleUnit = typeof angleUnits[number];

export const timeUnits = ["s", "ms"] as const;
export type TimeUnit = typeof timeUnits[number];

export const frequencyUnits = ["hz", "khz"] as const;
export type FrequencyUnit = typeof frequencyUnits[number];

export const resolutionUnits = ["dpi", "dpcm", "dppx", "x"] as const;
export type ResolutionUnit = typeof resolutionUnits[number];

export const dimensionUnits = [
  ...lengthUnits,
  ...angleUnits,
  ...timeUnits,
  ...frequencyUnits,
  ...resolutionUnits,
] as const;
export type DimensionUnit = typeof dimensionUnits[number];

export const cssUnits = [
  ...integerUnits,
  ...numberUnits,
  ...percentageUnits,
  ...dimensionUnits,
] as const;
export type CssUnit = typeof cssUnits[number];

export const absoluteLengthUnitFactors: Record<AbsoluteLengthUnit, number> = {
  cm: 96 / 2.54,
  mm: 96 / 2.54 / 10,
  Q: 96 / 2.54 / 10 / 4,
  in: 96,
  pc: 16,
  pt: 96 / 72,
  px: 1,
} as const;

export const angleUnitFactors: Record<AngleUnit, number> = {
  rad: 1,
  deg: Math.PI / 180,
  grad: Math.PI / 200,
  turn: Math.PI * 2,
} as const;

export const timeUnitFactors: Record<TimeUnit, number> = {
  ms: 0.001,
  s: 1,
} as const;

export const frequencyUnitFactors: Record<FrequencyUnit, number> = {
  khz: 0.001,
  hz: 1,
} as const;

export const resolutionUnitFactors: Record<ResolutionUnit, number> = {
  dpi: 96,
  dpcm: 96 / 2.54,
  dppx: 1,
  x: 1,
} as const;

type UnitWithValue = { unit: string; value: number };

export const unitTypes = [
  "number",
  "integer",
  "percentage",
  "length",
  "angle",
  "time",
  "frequency",
  "resolution",
] as const;
export type UnitType = typeof unitTypes[number];

/** Lowercase the unit name, if it is a known unit name. This is needed, because some units can also contain uppercase letters (e.g. kHz) */
const getLowercaseUnitName = (element: UnitWithValue | string) => {
  const unitName = typeof element === "string" ? element : element.unit;
  return includes(cssUnits, unitName.toLowerCase())
    ? unitName.toLowerCase()
    : unitName;
};

const isInteger = (element: UnitWithValue | string): boolean => {
  const unit = getLowercaseUnitName(element);
  const value = typeof element === "string" ? 0.5 : element.value;
  return (
    includes(integerUnits, unit) ||
    (includes(numberUnits, unit) && Number.isInteger(value))
  );
};

export const isNumber = (element: UnitWithValue | string): boolean => {
  const unit = getLowercaseUnitName(element);
  return includes(numberUnits, unit) || includes(integerUnits, unit);
};

const isPercentage = (element: UnitWithValue | string): boolean => {
  const unit = getLowercaseUnitName(element);
  return includes(percentageUnits, unit);
};

const isAbsoluteLength = (element: UnitWithValue | string): boolean => {
  const unit = getLowercaseUnitName(element);
  const value = typeof element === "string" ? 1 : element.value;
  return (
    includes(absoluteLengthUnits, unit) || (isNumber(element) && value === 0)
  );
};

const isViewportPercentageLength = (
  element: UnitWithValue | string
): boolean => {
  const unit = getLowercaseUnitName(element);
  const value = typeof element === "string" ? 1 : element.value;
  return (
    includes(viewportPercentageLengthUnits, unit) ||
    (isNumber(element) && value === 0)
  );
};

const isLength = (element: UnitWithValue | string): boolean => {
  const unit = getLowercaseUnitName(element);
  const value = typeof element === "string" ? 1 : element.value;
  return (
    includes(lengthUnits, unit) ||
    includes(percentageUnits, unit) ||
    (isNumber(element) && value === 0)
  );
};

const isAngle = (element: UnitWithValue | string): boolean => {
  const unit = getLowercaseUnitName(element);
  const value = typeof element === "string" ? 1 : element.value;
  return includes(angleUnits, unit) || (isNumber(element) && value === 0);
};

const isTime = (element: UnitWithValue | string): boolean => {
  const unit = getLowercaseUnitName(element);
  const value = typeof element === "string" ? 1 : element.value;
  return includes(timeUnits, unit) || (isNumber(element) && value === 0);
};

const isFrequency = (element: UnitWithValue | string): boolean => {
  const unit = getLowercaseUnitName(element);
  const value = typeof element === "string" ? 1 : element.value;
  return includes(frequencyUnits, unit) || (isNumber(element) && value === 0);
};

const isResolution = (element: UnitWithValue | string): boolean => {
  const unit = getLowercaseUnitName(element);
  const value = typeof element === "string" ? 1 : element.value;
  return includes(resolutionUnits, unit);
};

/** Convert units to a canonical type. For example all absolute lengths will be converted to px */
export const convertToCanonicalUnit = (
  element: UnitWithValue
): UnitWithValue => {
  const unit = getLowercaseUnitName(element);
  const value = element.value;

  if (includes(absoluteLengthUnits, unit)) {
    return {
      value: value * absoluteLengthUnitFactors[unit],
      unit: "px",
    };
  }

  if (includes(angleUnits, unit)) {
    return {
      value: value * angleUnitFactors[unit],
      unit: "rad",
    };
  }

  if (includes(timeUnits, unit)) {
    return {
      value: value * timeUnitFactors[unit],
      unit: "s",
    };
  }

  if (includes(frequencyUnits, unit)) {
    return {
      value: value * frequencyUnitFactors[unit],
      unit: "hz",
    };
  }

  if (includes(resolutionUnits, unit)) {
    return {
      value: value * resolutionUnitFactors[unit],
      unit: "dppx",
    };
  }

  if (isNumber(unit)) {
    return {
      value: value,
      unit: "number",
    };
  }

  return {
    unit,
    value,
  };
};

export const getCompatibleUnits = (unit: UnitWithValue | string) => [
  ...(isInteger(unit) ? (["integer"] as const) : []),
  ...(isNumber(unit) ? (["number"] as const) : []),
  ...(isPercentage(unit) ? (["percentage"] as const) : []),
  ...(isLength(unit) ? (["length"] as const) : []),
  ...(isAngle(unit) ? (["angle"] as const) : []),
  ...(isTime(unit) ? (["time"] as const) : []),
  ...(isFrequency(unit) ? (["frequency"] as const) : []),
  ...(isResolution(unit) ? (["resolution"] as const) : []),
];

const parseViewportPercentageLengthUnit = (
  unit: ViewportPercentageLengthUnit
) => {
  const parsedUnit = {
    prefix: unit.startsWith("v")
      ? ("" as "")
      : (unit.charAt(0) as "s" | "l" | "d"),
    suffix: unit.split("v")[1] as "w" | "h" | "i" | "b" | "min" | "max",
  };
  return parsedUnit;
};

/** Compare two values with unit.
 * A return value of 0 means that the values are the same.
 * A return value of 1 means that the first value is larger.
 * A return value of -1 means that the second value is larger.
 * A return value of undefined means that the values are not comparable, but compatible.
 * Throws an error if the values are not compatible
 */
export const compareValues = (a: UnitWithValue, b: UnitWithValue) => {
  const canonicalA = convertToCanonicalUnit(a);
  const canonicalB = convertToCanonicalUnit(b);

  const compatibleA = getCompatibleUnits(a);
  const compatibleB = getCompatibleUnits(b);

  if (!compatibleA.find((unit) => compatibleB.includes(unit))) {
    throw new Error(
      `Cannot compare values with incompatible units (${a.unit} with ${b.unit})`
    );
  }

  const comparison =
    canonicalA.value > canonicalB.value
      ? 1
      : canonicalA.value < canonicalB.value
      ? -1
      : 0;

  // Check all direkt comparisons. Because we use canonical units, we can assume that the values are in the same unit, if both are the same absolute category
  if (
    // (isNumber(canonicalA) && isNumber(canonicalB)) ||
    // (isAngle(canonicalA) && isAngle(canonicalB)) ||
    // (isTime(canonicalA) && isTime(canonicalB)) ||
    // (isFrequency(canonicalA) && isFrequency(canonicalB)) ||
    // (isResolution(canonicalA) && isResolution(canonicalB)) ||
    // (isPercentage(canonicalA) && isPercentage(canonicalB)) ||
    // (isAbsoluteLength(canonicalA) && isAbsoluteLength(canonicalB)) ||
    canonicalA.unit === canonicalB.unit ||
    canonicalA.value === 0 ||
    canonicalB.value === 0
  ) {
    return comparison;
  }

  if (
    includes(viewportPercentageLengthUnits, canonicalA.unit) &&
    includes(viewportPercentageLengthUnits, canonicalB.unit)
  ) {
    const aType = parseViewportPercentageLengthUnit(canonicalA.unit);
    const bType = parseViewportPercentageLengthUnit(canonicalB.unit);

    if (
      comparison === 1 &&
      aType.suffix === bType.suffix &&
      (aType.prefix === "l" || bType.prefix === "s")
    ) {
      return 1;
    }
    if (
      comparison === -1 &&
      aType.suffix === bType.suffix &&
      (bType.prefix === "l" || aType.prefix === "s")
    ) {
      return -1;
    }

    if (
      comparison === 1 &&
      aType.prefix === bType.prefix &&
      (aType.suffix === "max" || bType.suffix === "min")
    ) {
      return 1;
    }
    if (
      comparison === -1 &&
      aType.prefix === bType.prefix &&
      (bType.suffix === "max" || aType.suffix === "min")
    ) {
      return -1;
    }
  }

  return undefined;
};

export const checkAdditionCompatibility = (
  ...elements: Array<UnitWithValue | UnitType[]>
) => {
  const compatibleUnits = elements.map((element) =>
    Array.isArray(element) ? element : getCompatibleUnits(element)
  );

  if (compatibleUnits.length === 1) {
    return compatibleUnits[0];
  }

  const commonUnits = compatibleUnits.reduce(
    (acc, curr) => {
      return acc.filter((unit) => curr.includes(unit));
    },
    [...unitTypes]
  );

  return commonUnits;
};

export const checkMultiplicationCompatibility = (
  ...elements: Array<UnitWithValue | UnitType[]>
) => {
  const compatibleUnits = elements.map((element) =>
    Array.isArray(element) ? element : getCompatibleUnits(element)
  );

  if (compatibleUnits.length === 1) {
    return compatibleUnits[0];
  }

  const elementsWithUnit = compatibleUnits.flatMap(
    (compatibleUnits) =>
      compatibleUnits.includes("number") ? [] : [compatibleUnits],
    0
  );

  const possibleResultUnits =
    elementsWithUnit.length > 1
      ? [] // Cannot multiply if there is more then one unit in the equation
      : elementsWithUnit.length === 1
      ? elementsWithUnit[0] // If there is only one unit, the result has to be that unit
      : [...compatibleUnits.flat()].filter(
          (value, index, array) => array.indexOf(value) === index
        ); // If there is no unit, the result can be any of the possible units

  return possibleResultUnits;
};

export const checkMinMaxCompatibility = (
  ...elements: Array<UnitWithValue | UnitType[]>
) => {
  const compatibleUnits = elements.map((element) =>
    Array.isArray(element) ? element : getCompatibleUnits(element)
  );

  const commonUnits = compatibleUnits.reduce(
    (acc, curr) => {
      return acc.filter((unit) => curr.includes(unit));
    },
    [...unitTypes]
  );

  return commonUnits;
};

export const checkValidDivider = (element: UnitWithValue | UnitType[]) => {
  const compatibleUnits = Array.isArray(element)
    ? element
    : getCompatibleUnits(element);

  return (
    compatibleUnits.includes("number") &&
    (Array.isArray(element) || element.value !== 0)
  );
};
