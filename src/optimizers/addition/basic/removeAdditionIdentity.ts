import { reverseVisitor } from "reverseVisitor";
import { MultiplicationNode, Node, ValueNode } from "parseCalc";

export const removeAdditionIdentity = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "addition") {
      return node;
    }

    const newValues = node.values.filter(
      (valueNode) =>
        !(valueNode.value.type === "value" && valueNode.value.value === 0)
    );

    if (newValues.length === 0) {
      return {
        type: "value",
        unit: "number",
        value: 0,
      };
    }

    return {
      ...node,
      values: newValues,
    };
  });
};
