import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const removeAdditionIdentity = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "addition") {
        return node;
      }

      return {
        ...node,
        values: node.values.filter(
          (valueNode) =>
            (valueNode.value.type !== "value" &&
              valueNode.value.type !== "var") ||
            valueNode.value.value !== 0
        ),
      };
    }
  );
};
