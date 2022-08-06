import { CssUnit, cssUnits } from "cssUnitFunctions";
import {
  AdditionNode,
  CalcNode,
  ClampNode,
  MaxNode,
  MinNode,
  MultiplicationNode,
  Node,
  ParenthesisNode,
  ValueNode,
  VarNode,
} from "parseCalc";
let normalConsole = require("console");

export const stringifyNode = (node: Node) => {
  switch (node.type) {
    case "value":
      return stringifyValue(node);
    case "min":
    case "max":
      return stringifyMinMax(node);
    case "clamp":
      return stringifyClamp(node);
    case "parenthesis":
      return stringifyParenthesis(node);
    case "addition":
      return stringifyAddition(node);
    case "multiplication":
      return stringifyMultiplication(node);
    case "calc":
      return stringifyCalc(node);
    case "var":
      return stringifyVar(node);
    default:
      const x: never = node;
      return "";
  }
};

export const debugNode = (node: Node, indent = 0) => {
  switch (node.type) {
    case "value":
      normalConsole.log(
        `${new Array(indent).fill(" ").join("")}${stringifyValue(node)}`
      );
      return;
    case "min":
    case "max":
      normalConsole.log(`${new Array(indent).fill(" ").join("")}${node.type}`);
      node.values.forEach((value) => debugNode(value, indent + 2));
      return;
    case "clamp":
      normalConsole.log(`${new Array(indent).fill(" ").join("")}clamp`);
      debugNode(node.min, indent + 2);
      debugNode(node.value, indent + 2);
      debugNode(node.max, indent + 2);
      return;
    case "parenthesis":
      // normalConsole.log(`${new Array(indent).fill(" ").join("")}(`);
      debugNode(node.value, indent);
      // normalConsole.log(`${new Array(indent).fill(" ").join("")})`);
      return;
    case "addition":
      normalConsole.log(`${new Array(indent).fill(" ").join("")}addition`);
      node.values.forEach((value) => {
        normalConsole.log(
          `${new Array(indent).fill(" ").join("")}${value.operation}`
        );
        debugNode(value.value, indent + 2);
      });
      return;
    case "multiplication":
      normalConsole.log(
        `${new Array(indent).fill(" ").join("")}multiplication`
      );
      node.values.forEach((value) => {
        normalConsole.log(
          `${new Array(indent).fill(" ").join("")}${value.operation}`
        );
        debugNode(value.value, indent + 2);
      });
      return;
    case "calc":
      normalConsole.log(
        `${new Array(indent).fill(" ").join("")}${node.prefix ?? "calc"}(`
      );
      debugNode(node.value, indent + 2);
      normalConsole.log(`${new Array(indent).fill(" ").join("")})`);
      return;
    case "var":
      normalConsole.log(
        `${new Array(indent).fill(" ").join("")}${stringifyVar(node)}`
      );
      return;
    default:
      const x: never = node;
      normalConsole.log("error");
  }
};

//Reliably round to a given number of decimal places
const round = (value: number, maxPrecision: number) =>
  +(+value.toFixed(maxPrecision + 1)).toFixed(maxPrecision);

const stringifyValue = (node: ValueNode, precision = 5) => {
  if (node.value == 0) {
    return "0";
  }
  if (node.unit === "number" || node.unit === "integer") {
    return `${round(node.value, precision)}`;
  }
  if (cssUnits.includes(node.unit as CssUnit)) {
    return `${round(node.value, precision)}${node.unit}`;
  }
  throw new Error(
    `Can not to convert value node with value: ${round(
      node.value,
      precision
    )} and unit: ${node.unit} to string`
  );
};

const stringifyVar = (node: VarNode): string => {
  const replacementStrings = Object.entries(node.values).map(
    ([key, node]) => [key, stringifyNode(node)] as const
  );
  const safeKeys = new Array(replacementStrings.length).fill(0).map(() =>
    new Array(20)
      .fill(0)
      .map(() => Math.random().toString(36)[2])
      .join("")
  );
  const safeTemplate = Object.keys(node.values).reduce(
    (template, string, index) => template.replaceAll(string, safeKeys[index]),
    node.value
  );
  const result = replacementStrings
    .map(([key, text], index) => [safeKeys[index], text])
    .reduce(
      (template, [key, text]) => template.replaceAll(key, text),
      safeTemplate
    );
  return result;
};

const stringifyMinMax = (node: MinNode | MaxNode): string => {
  return `${node.type}(${node.values.map(stringifyNode).join(",")})`;
};

const stringifyClamp = (node: ClampNode): string => {
  return `clamp(${stringifyNode(node.min)},${stringifyNode(
    node.value
  )},${stringifyNode(node.max)})`;
};

const stringifyParenthesis = (node: ParenthesisNode): string => {
  return `(${stringifyNode(node.value)})`;
};

const stringifyAddition = (node: AdditionNode): string => {
  if (node.values.length === 0) {
    return "0";
  }
  const positiveValues = node.values
    .filter((value) => value.operation === "+")
    .map((value) => value.value)
    .map((value) => stringifyNode(value));
  const negativeValues = node.values
    .filter((value) => value.operation === "-")
    .map((value) => value.value)
    .map((value) => stringifyNode(value));

  const positiveValuesOrZero = positiveValues.length ? positiveValues : ["0"];
  return [positiveValuesOrZero.join(" + "), ...negativeValues].join(" - ");
};

const stringifyMultiplication = (node: MultiplicationNode): string => {
  if (node.values.length === 0) {
    throw new Error("Can not stringify empty multiplication node");
  }
  const multiplicationValues = node.values
    .filter((value) => value.operation === "*")
    .map((value) => value.value)
    .map((value) => stringifyNode(value));
  const divisionValues = node.values
    .filter((value) => value.operation === "/")
    .map((value) => value.value)
    .map((value) => stringifyNode(value));

  const multiplicationValuesOrOne = multiplicationValues.length
    ? multiplicationValues
    : ["1"];
  return [multiplicationValuesOrOne.join("*"), ...divisionValues].join("/");
};

const stringifyCalc = (node: CalcNode): string => {
  return `${node.prefix ?? "calc"}(${stringifyNode(node.value)})`;
};
