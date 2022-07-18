import { stringifyNode } from "stringifyNode";
import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const sortNodes = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type === "addition") {
        return {
          ...node,
          values: node.values.sort((a, b) => {
            const aString = stringifyNode(a.value);
            const bString = stringifyNode(b.value);
            return aString.localeCompare(bString);
          }),
        };
      }

      if (node.type === "multiplication") {
        return {
          ...node,
          values: node.values.sort((a, b) => {
            const aString = stringifyNode(a.value);
            const bString = stringifyNode(b.value);
            return aString.localeCompare(bString);
          }),
        };
      }

      if (node.type === "min" || node.type === "max") {
        return {
          ...node,
          values: node.values.sort((a, b) => {
            const aString = stringifyNode(a);
            const bString = stringifyNode(b);
            return aString.localeCompare(bString);
          }),
        };
      }

      return node;
    }
  );
};
