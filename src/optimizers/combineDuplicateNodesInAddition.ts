import { compareValues, isNumber } from "cssUnitFunctions";
import { reverseVisitor } from "reverseVisitor";
import { stringifyNode } from "stringifyNode";
import {
  AdditionNode,
  MultiplicationNode,
  Node,
  ValueNode,
} from "../parseCalc";
import { visitor } from "../visitor";

/** Move all factors in multiplications into a seperate value
 *
 * var(--a) + var(--a) + 2 => var(--a)*2 + 2
 * var(--a) + 2*var(--a) + 2 => var(--a)*3 + 2
 *
 */
export const combineDuplicateNodesInAddition = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "addition") {
      return node;
    }

    const values = node.values.map((value) => {
      if (value.value.type === "value") {
        const normalizedValue = {
          ...value.value,
          value: 1,
        };
        return {
          ...value,
          factor: (value.operation === "+" ? 1 : -1) * value.value.value,
          text: stringifyNode(normalizedValue),
          value: normalizedValue as ValueNode,
          operation: "+" as const,
        };
      }
      if (value.value.type === "multiplication") {
        const factor = value.value.values.reduce(
          (acc, element) =>
            element.value.type === "value" && element.value.unit === "number"
              ? element.operation === "*"
                ? acc * element.value.value
                : acc / element.value.value
              : acc,
          1
        );
        const nonFactorNodes = value.value.values.filter(
          (element) =>
            !(element.value.type === "value" && element.value.unit === "number")
        );
        const newMultiplicationNode = {
          ...value.value,
          values: nonFactorNodes,
        } as MultiplicationNode;
        return {
          ...value,
          factor: (value.operation === "+" ? 1 : -1) * factor,
          value: newMultiplicationNode,
          text: stringifyNode(newMultiplicationNode),
          operation: "+" as const,
        };
      }
      return {
        ...value,
        factor: value.operation === "+" ? 1 : -1,
        text: stringifyNode(value.value),
        operation: "+" as const,
      };
    });

    const valueMap = values.reduce((valueMap, value) => {
      return {
        ...valueMap,
        [value.text]: {
          count: (valueMap[value.text]?.count ?? 0) + value.factor,
          content: value.value,
        },
      };
    }, {} as Record<string, { count: number; content: Node }>);

    const valueObjects: {
      operation: "+" | "-";
      value: Node;
    }[] = Object.values(valueMap)
      .filter(({ count }) => count)
      .map(({ count, content }) => {
        return {
          operation: count > 0 ? "+" : "-",
          value:
            Math.abs(count) === 1
              ? content
              : {
                  type: "multiplication",
                  values: [
                    {
                      operation: "*",
                      value: {
                        type: "value",
                        unit: "number",
                        value: Math.abs(count),
                      },
                    } as const,
                    { operation: "*", value: content } as const,
                  ],
                },
        };
      });

    return { ...node, values: valueObjects };
  });
};
