import { MultiplicationNode, Node, ValueNode } from "../../parseCalc";
import { visitor } from "../../visitor";

export const tryToKeepOnePositiveNodeInEveryAddition = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node): Node => {
      if (node.type !== "addition") {
        return node;
      }

      const positiveValues = node.values
        .filter((value) => value.operation === "+")
        .map((value) => value.value);
      const negativeValues = node.values
        .filter((value) => value.operation === "-")
        .map((value) => value.value);

      if (positiveValues.length !== 0) {
        return node;
      }

      const negativeValue = negativeValues.find(
        (value) => value.type === "value"
      ) as ValueNode | undefined;

      if (!negativeValue) {
        return node;
      }

      return {
        ...node,
        values: [
          ...negativeValues
            .filter((value) => value !== negativeValue)
            .map((value) => ({ operation: "-" as const, value })),
          {
            operation: "+",
            value: { ...negativeValue, value: negativeValue.value * -1 },
          },
        ],
      };
    }
  );
};
