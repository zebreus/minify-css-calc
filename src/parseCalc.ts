import { debugNode, stringifyNode } from "./stringifyNode";
import { removeMultiplicationIdentity } from "./optimizers/removeMultiplicationIdentity";
import { optimizeAst } from "optimizeAst";
import { fixBrokenMultiplication } from "./optimizers/fixBrokenMultiplication";
import { clampToMinAndMax } from "optimizers/clampToMinAndMax";
import { convertAbsoluteUnitsToPixels } from "optimizers/convertAbsoluteUnitsToPixels";
import { minAndMaxToClamp } from "optimizers/minAndMaxToClamp";
import { removeObviousMinMaxValues } from "optimizers/removeObviousMinMaxValues";
import { addRangeInfoToMinMaxStatements } from "optimizers/addRangeInfoToMinMaxNodes";
import { integrateNestedMinMaxNodes } from "optimizers/integrateNestedMinMaxNodes";
import { stripUnnecessaryParenthesis } from "optimizers/stripUnnecessaryParenthesis";
import { evaluateBasicAddition } from "optimizers/evaluateBasicAddition";
import { stripUnnecessaryMathNode } from "optimizers/stripUnnecessaryMathNode";
import { evaluateBasicMultiplication } from "optimizers/evaluateBasicMultiplication";
import { addCalcOnRootLevelIfRequired } from "optimizers/addCalcOnRootLevelIfRequired";
import { sortNodes } from "optimizers/sortNodes";
import { removeAdditionIdentity } from "optimizers/removeAdditionIdentity";
import { tryToKeepOnePositiveNodeInEveryAddition } from "optimizers/tryToKeepOnePositiveNodeInEveryAddition";
import { UnitType } from "cssUnitFunctions";
import { checkMathUnitCompatibility } from "optimizers/checkMathUnitCompatibility";
import { expandMultiplications } from "optimizers/expandMultiplications";
import { addNecessaryParenthesis } from "optimizers/addNecessaryParenthesis";
import { stripOptionalInformation } from "optimizers/stripOptionalInformation";
import { integrateNestedAddition } from "optimizers/integrateNestedAddition";
import { integrateNestedMultiplication } from "optimizers/integrateNestedMultiplication";
import { normalizeMultiplication } from "optimizers/normalizeMultiplications";
import { integrateFreeValueIntoUnitInMultiplication } from "optimizers/integrateFreeValueIntoUnitInMultiplication";
import { combineDuplicateNodesInAddition } from "optimizers/combineDuplicateNodesInAddition";

const optimizations = [
  [clampToMinAndMax, convertAbsoluteUnitsToPixels],
  // This stage does most of the optimizations, but may leave the ast weirdly formatted
  [
    sortNodes,
    checkMathUnitCompatibility,
    stripUnnecessaryParenthesis,
    stripUnnecessaryMathNode,
    sortNodes,
    integrateNestedMinMaxNodes,
    expandMultiplications,
    integrateNestedAddition,
    integrateNestedMultiplication,
    evaluateBasicAddition,
    evaluateBasicMultiplication,
    sortNodes,
    removeMultiplicationIdentity,
    removeAdditionIdentity,
    fixBrokenMultiplication,
    sortNodes,
    removeObviousMinMaxValues,
    stripUnnecessaryMathNode,
    addRangeInfoToMinMaxStatements,
    normalizeMultiplication,
    combineDuplicateNodesInAddition,
    stripUnnecessaryMathNode,
    sortNodes,
    integrateFreeValueIntoUnitInMultiplication,
  ],
  // Clean and reduce tree
  [
    sortNodes,
    removeMultiplicationIdentity,
    removeAdditionIdentity,
    integrateFreeValueIntoUnitInMultiplication,
    stripUnnecessaryMathNode,
  ],
  [
    stripUnnecessaryMathNode,
    addNecessaryParenthesis,
    tryToKeepOnePositiveNodeInEveryAddition,
    sortNodes,
    minAndMaxToClamp,
    addCalcOnRootLevelIfRequired,
    stripOptionalInformation,
  ],
];

export const parseCalc = (
  input: string,
  parserFunction: (input: string) => any
) => {
  const ast: Node = parserFunction(input);
  //console.log(ast);
  const optimizedAst = optimizeAst(ast, optimizations);
  //debugNode(optimizedAst);
  return stringifyNode(optimizedAst);
};

const absoluteUnitLengths = {
  cm: 37.8,
  mm: 3.78,
  Q: 0.945,
  in: 96,
  pc: 16,
  pt: 96 / 72,
  px: 1,
} as const;
const absoluteUnits = Object.keys(absoluteUnitLengths) as Array<
  keyof typeof absoluteUnitLengths
>;

export type Node =
  | MaxNode
  | MinNode
  | ClampNode
  | ParenthesisNode
  | AdditionNode
  | MultiplicationNode
  | ValueNode
  | VarNode
  | CalcNode;

export type MaxNode = {
  type: "max";
  values: Array<Node>;
  rangeInfo?: Array<{ unit: string; min: number; max: number }>;
  possibleUnits?: Array<UnitType>;
};

export type MinNode = {
  type: "min";
  values: Array<Node>;
  rangeInfo?: Array<{ unit: string; min: number; max: number }>;
  possibleUnits?: Array<UnitType>;
};

export type ClampNode = {
  type: "clamp";
  min: Node;
  value: Node;
  max: Node;
  rangeInfo?: Array<{ unit: string; min: number; max: number }>;
  possibleUnits?: Array<UnitType>;
};

export type ValueNode = {
  type: "value";
  value: number;
  unit: string;
  rangeInfo?: Array<{ unit: string; min: number; max: number }>;
  possibleUnits?: Array<UnitType>;
};

export type VarNode = {
  type: "var";
  value: number;
  name: string;
  rangeInfo?: Array<{ unit: string; min: number; max: number }>;
  possibleUnits?: Array<UnitType>;
};

export type ParenthesisNode = {
  type: "parenthesis";
  value: Node;
  rangeInfo?: Array<{ unit: string; min: number; max: number }>;
  possibleUnits?: Array<UnitType>;
};

export type AdditionNode = {
  type: "addition";
  values: Array<{ value: Node; operation: "+" | "-" }>;
  rangeInfo?: Array<{ unit: string; min: number; max: number }>;
  possibleUnits?: Array<UnitType>;
};

export type MultiplicationNode = {
  type: "multiplication";
  values: Array<{ value: Node; operation: "*" | "/" }>;
  rangeInfo?: Array<{ unit: string; min: number; max: number }>;
  possibleUnits?: Array<UnitType>;
};

export type CalcNode = {
  type: "calc";
  value: Node;
  rangeInfo?: Array<{ unit: string; min: number; max: number }>;
  possibleUnits?: Array<UnitType>;
};
