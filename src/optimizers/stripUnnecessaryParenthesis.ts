import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const stripUnnecessaryParenthesis = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "parenthesis" && node.type !== "calc") {
        return node;
      }

      return node.value;
    }
  );
};
