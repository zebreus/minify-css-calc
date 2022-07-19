import { UnitType } from "cssUnitFunctions";
import { optimizeAst, OptimizerStage } from "optimizeAst";
import { addCalcOnRootLevelIfRequired } from "optimizers/addCalcOnRootLevelIfRequired";
import { combineDuplicateNodesInAddition } from "optimizers/addition/combineDuplicateNodesInAddition";
import { evaluateBasicAddition } from "optimizers/addition/evaluateBasicAddition";
import { integrateNestedAddition } from "optimizers/addition/integrateNestedAddition";
import { removeAdditionIdentity } from "optimizers/addition/removeAdditionIdentity";
import { tryToKeepOnePositiveNodeInEveryAddition } from "optimizers/addition/tryToKeepOnePositiveNodeInEveryAddition";
import { addNecessaryParenthesis } from "optimizers/addNecessaryParenthesis";
import { checkMathUnitCompatibility } from "optimizers/checkMathUnitCompatibility";
import { convertAbsoluteUnitsToCanonicalUnits } from "optimizers/convertAbsoluteUnitsToCanonicalUnits";
import { addRangeInfoToMinMaxStatements } from "optimizers/minmax/addRangeInfoToMinMaxNodes";
import { clampToMinAndMax } from "optimizers/minmax/clampToMinAndMax";
import { integrateNestedMinMaxNodes } from "optimizers/minmax/integrateNestedMinMaxNodes";
import { minAndMaxToClamp } from "optimizers/minmax/minAndMaxToClamp";
import { removeObviousMinMaxValues } from "optimizers/minmax/removeObviousMinMaxValues";
import { evaluateBasicMultiplication } from "optimizers/multiplication/evaluateBasicMultiplication";
import { expandMultiplications } from "optimizers/multiplication/expandMultiplications";
import { integrateNestedMultiplication } from "optimizers/multiplication/integrateNestedMultiplication";
import { sortNodes } from "optimizers/sortNodes";
import { stripOptionalInformation } from "optimizers/stripOptionalInformation";
import { stripUnnecessaryMathNode } from "optimizers/stripUnnecessaryMathNode";
import { stripUnnecessaryParenthesis } from "optimizers/stripUnnecessaryParenthesis";
import { stringifyNode } from "./stringifyNode";

const optimizations: OptimizerStage = [
  [clampToMinAndMax, convertAbsoluteUnitsToCanonicalUnits],
  // This stage does most of the optimizations, but may leave the ast weirdly formatted
  [
    sortNodes,
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
    removeAdditionIdentity,
    sortNodes,
    removeObviousMinMaxValues,
    stripUnnecessaryMathNode,
    addRangeInfoToMinMaxStatements,
    combineDuplicateNodesInAddition,
    stripUnnecessaryMathNode,
    sortNodes,
  ],
  // Do a final round of value math
  [evaluateBasicMultiplication, evaluateBasicAddition],
  // Clean and reduce tree
  [
    sortNodes,
    removeAdditionIdentity,
    stripUnnecessaryMathNode,
    stripUnnecessaryParenthesis,
  ],
  // Check for math unit compatibility
  checkMathUnitCompatibility,
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
  value: string;
  values: Record<string, Node>;
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
