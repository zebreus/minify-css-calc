import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const stripUnnecessaryMathNode = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "addition" && node.type !== "multiplication") {
        return node;
      }

      if (node.values.length !== 1) {
        return node;
      }

      if (
        node.values.length === 1 &&
        (node.values[0].operation === "*" || node.values[0].operation === "+")
      ) {
        return node.values[0].value;
      }

      if (
        node.values.length === 1 &&
        (node.values[0].operation === "-" ||
          node.values[0].operation === "/") &&
        node.values[0].value.type === "value"
      ) {
        return {
          type: "value",
          unit: node.values[0].value.unit,
          value:
            node.values[0].operation === "-"
              ? node.values[0].value.value * -1
              : 1 / node.values[0].value.value,
        };
      }

      return node;
    }
  );
};
