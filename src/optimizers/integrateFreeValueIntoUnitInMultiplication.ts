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

/** Integrate a free value into a real value in a multiplication node if possible
 *
 * 1rem * var(--test) * 2 => 2rem
 *
 * Also deduplicates nodes in multiplications
 */
export const integrateFreeValueIntoUnitInMultiplication = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "multiplication") {
      return node;
    }

    const freeFactors = node.values.flatMap((value) =>
      value.operation === "*" &&
      value.value.type === "value" &&
      value.value.unit === "number"
        ? [value.value]
        : []
    );

    const factor = freeFactors.reduce(
      (factor, value) => factor * value.value,
      1
    );

    const remainingValues = node.values.filter(
      (value) =>
        !(
          value.operation === "*" &&
          value.value.type === "value" &&
          value.value.unit === "number"
        )
    );

    const valueWithDimension = node.values.flatMap((value) =>
      value.operation === "*" &&
      value.value.type === "value" &&
      value.value.unit !== "number"
        ? [value]
        : []
    )[0];

    if (!valueWithDimension) {
      return {
        ...node,
        values: [
          ...remainingValues,
          ...(factor !== 1
            ? [
                {
                  operation: "*" as const,
                  value: {
                    type: "value" as const,
                    value: factor,
                    unit: "number",
                  },
                },
              ]
            : []),
        ],
      };
    }

    return {
      ...node,
      values: [
        ...remainingValues.filter((value) => value !== valueWithDimension),
        {
          ...valueWithDimension,
          value: {
            ...(valueWithDimension.value as ValueNode),
            value: (valueWithDimension.value as ValueNode).value * factor,
          },
        },
      ],
    };
  });
};
