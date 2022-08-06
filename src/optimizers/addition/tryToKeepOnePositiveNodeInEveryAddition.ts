import { MultiplicationNode, Node, ValueNode } from "../../parseCalc";
import { visitor } from "../../visitor";

/**
 * The shortest representation for addition nodes can be achieved, by having at least one add operation and reducing the number of signed values
 *
 * 1px + -1 => 1px - 1
 * 0 - 1in - 1px => -1in - 1px
 */
export const tryToKeepOnePositiveNodeInEveryAddition = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node): Node => {
      if (node.type !== "addition") {
        return node;
      }

      const valueElements = node.values.flatMap((value) =>
        value.value.type === "value" ? [{ ...value, value: value.value }] : []
      );
      const otherElements = node.values.filter(
        (value) => value.value.type !== "value"
      );

      const positiveValueElements = valueElements.map((element) => ({
        ...element,
        operation:
          element.operation === (element.value.value.gte(0) ? "+" : "-")
            ? ("+" as const)
            : ("-" as const),
        value: {
          ...element.value,
          value: element.value.value.abs(),
        } as ValueNode,
      }));

      const alreadyHasPositiveOperation =
        otherElements.some((element) => element.operation === "+") ||
        positiveValueElements.some((element) => element.operation === "+");

      const newValueElements = alreadyHasPositiveOperation
        ? [...positiveValueElements, ...otherElements]
        : positiveValueElements.length > 0
        ? [
            {
              operation: "+" as const,
              value: {
                ...positiveValueElements[0].value,
                value: positiveValueElements[0].value.value.mul(-1),
              } as ValueNode,
            },
            ...positiveValueElements.slice(1),
            ...otherElements,
          ]
        : [...positiveValueElements, ...otherElements];

      return {
        ...node,
        values: newValueElements,
      };
    }
  );
};
