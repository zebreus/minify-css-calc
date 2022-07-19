import { reverseVisitor } from "reverseVisitor";
import { debugNode } from "stringifyNode";
import { MultiplicationNode, Node } from "../../parseCalc";
import { visitor } from "../../visitor";

export const integrateNestedMultiplication = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "multiplication") {
      return node;
    }

    const nestedMultiplicationValues = node.values.flatMap((value) =>
      value.value.type === "multiplication"
        ? value.value.values.map(
            (nestedValue) =>
              ({
                operation:
                  value.operation === nestedValue.operation ? "*" : "/",
                value: nestedValue.value,
              } as const)
          )
        : []
    );

    const newValues = [
      ...node.values.filter((value) => value.value.type !== "multiplication"),
      ...nestedMultiplicationValues,
    ];

    return {
      ...node,
      values: newValues,
    };
  });
};
