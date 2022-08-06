import { debugNode, stringifyNode } from "stringifyNode";
import { AdditionNode, MultiplicationNode, Node, ValueNode } from "parseCalc";
import { reverseVisitor } from "reverseVisitor";
import Big from "big.js";

export const removeUnneccessaryAddition = (node: Node): Node => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "addition") {
      return node;
    }

    if (node.values.length === 1 && node.values[0].operation === "+") {
      return node.values[0].value;
    }
    if (
      node.values.length === 1 &&
      node.values[0].value.type === "value" &&
      node.values[0].operation === "-"
    ) {
      return {
        ...node.values[0].value,
        value: node.values[0].value.value.mul(-1),
      };
    }
    if (node.values.length === 0) {
      return {
        ...node,
        type: "value",
        unit: "number",
        value: Big(0),
      };
    }
    return node;
  });
};
