import { debugNode, stringifyNode } from "stringifyNode";
import { AdditionNode, MultiplicationNode, Node, ValueNode } from "parseCalc";
import { reverseVisitor } from "reverseVisitor";

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
      return { ...node.values[0].value, value: -node.values[0].value.value };
    }
    if (node.values.length === 0) {
      return {
        ...node,
        type: "value",
        unit: "number",
        value: 0,
      };
    }
    return node;
  });
};
