import { reverseVisitor } from "reverseVisitor";
import { MultiplicationNode, Node, ValueNode } from "parseCalc";

export const addValueNodesInAddition = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "addition") {
      return node;
    }

    const valueElements = node.values.flatMap((value) =>
      value.value.type === "value" ? [{ ...value, value: value.value }] : []
    );

    const otherElements = node.values.filter(
      (value) => value.value.type !== "value"
    );

    const sumPerUnit = valueElements.reduce(
      (acc, value) => ({
        ...acc,
        [value.value.unit]:
          (acc[value.value.unit] ?? 0) +
          (value.operation === "+" ? value.value.value : -value.value.value),
      }),
      {} as Record<string, number>
    );

    const newElements = Object.entries(sumPerUnit).map(([unit, value]) => ({
      operation: "+" as const,
      value: { type: "value" as const, unit, value },
    }));

    return { ...node, values: [...newElements, ...otherElements] };
  });
};
