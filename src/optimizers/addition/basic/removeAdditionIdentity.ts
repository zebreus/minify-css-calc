import { reverseVisitor } from "reverseVisitor";
import { MultiplicationNode, Node, ValueNode } from "parseCalc";
import Big from "big.js";

export const removeAdditionIdentity = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "addition") {
      return node;
    }

    const newValues = node.values.filter(
      (valueNode) =>
        !(valueNode.value.type === "value" && valueNode.value.value.eq(0))
    );

    if (newValues.length === 0) {
      return {
        type: "value",
        unit: "number",
        value: Big(0),
      };
    }

    return {
      ...node,
      values: newValues,
    };
  });
};
