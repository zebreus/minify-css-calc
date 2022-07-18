import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const fixBrokenMultiplication = (node: Node) => {
  return visitor(
    node,
    (node) => node.type === "multiplication",
    (node: Node) => {
      if (node.type !== "multiplication") {
        return node;
      }

      if (!node.values.length) {
        return { type: "value", value: 1, unit: "number" };
      }

      if (node.values.length === 1 && node.values[0].operation === "*") {
        return node.values[0].value;
      }

      return node;
    }
  );
};
