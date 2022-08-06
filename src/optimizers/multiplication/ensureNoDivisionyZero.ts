import { debugNode, stringifyNode } from "stringifyNode";
import { MultiplicationNode, Node, ValueNode } from "../../parseCalc";
import { visitor } from "../../visitor";

export const ensureNoDivisionByZero = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "multiplication") {
        return node;
      }

      node.values.forEach((value) => {
        if (
          value.value.type === "value" &&
          value.operation === "/" &&
          value.value.value.eq(0)
        ) {
          throw new Error(`Division by zero in ${stringifyNode(node)}`);
        }
      });

      return node;
    }
  );
};
