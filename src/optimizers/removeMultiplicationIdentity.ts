import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const removeMultiplicationIdentity = (node: Node) => {
  return visitor(
    node,
    (node) => node.type === "multiplication",
    (node: Node) => {
      if (node.type !== "multiplication") {
        throw new Error("This should always be a multiplication node");
      }

      const values = node.values.filter(
        (value) =>
          !(
            value.value.type === "value" &&
            value.value.unit === "number" &&
            value.value.value === 1
          )
      );

      return { ...node, values };
    }
  );
};
