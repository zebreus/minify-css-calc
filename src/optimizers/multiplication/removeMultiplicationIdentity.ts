import { reverseVisitor } from "reverseVisitor";
import { MultiplicationNode, Node, ValueNode } from "parseCalc";

export const removeMultiplicationIdentity = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "multiplication") {
      return node;
    }

    const negativeOneNodesCount = node.values.filter(
      (valueNode) =>
        valueNode.value.type === "value" &&
        valueNode.value.unit === "number" &&
        valueNode.value.value === -1
    ).length;
    const removeValues = negativeOneNodesCount % 2 === 0 ? [-1, 1] : [1];

    const newValues = node.values.filter(
      (valueNode) =>
        !(
          valueNode.value.type === "value" &&
          valueNode.value.unit === "number" &&
          removeValues.includes(valueNode.value.value)
        )
    );

    if (newValues.length === 0) {
      return {
        type: "value",
        unit: "number",
        value: 1,
      };
    }

    return {
      ...node,
      values: newValues,
    };
  });
};
