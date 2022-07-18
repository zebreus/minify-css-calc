import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

/** Addition inside a multiplication needs to be enclosed by parenthesis */
export const addNecessaryParenthesis = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "multiplication") {
        return node;
      }

      return {
        ...node,
        values: node.values.map((value) => ({
          ...value,
          value:
            value.value.type === "addition"
              ? {
                  type: "parenthesis",
                  value: value.value,
                }
              : value.value,
        })),
      };
    }
  );
};
