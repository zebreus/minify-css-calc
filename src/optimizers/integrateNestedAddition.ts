import { reverseVisitor } from "reverseVisitor";
import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const integrateNestedAddition = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "addition") {
      return node;
    }

    const nestedAdditionValues = node.values.flatMap((value) =>
      value.value.type === "addition"
        ? value.value.values.map(
            (nestedValue) =>
              ({
                operation:
                  value.operation === nestedValue.operation ? "+" : "-",
                value: nestedValue.value,
              } as const)
          )
        : []
    );

    const newValues = [
      ...node.values.filter((value) => value.value.type !== "addition"),
      ...nestedAdditionValues,
    ];

    return {
      ...node,
      values: newValues,
    };
  });
};
