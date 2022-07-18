import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const addCalcOnRootLevelIfRequired = (node: Node): Node => {
  if (node.type === "addition" || node.type === "multiplication") {
    return {
      type: "calc",
      value: node,
    };
  }

  if (node.type === "parenthesis") {
    return {
      ...node,
      type: "calc",
    };
  }

  return node;
};
