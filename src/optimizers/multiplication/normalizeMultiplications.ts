import { compareValues, isNumber } from "cssUnitFunctions";
import { reverseVisitor } from "reverseVisitor";
import { stringifyNode } from "stringifyNode";
import {
  AdditionNode,
  MultiplicationNode,
  Node,
  ValueNode,
} from "../../parseCalc";
import { visitor } from "../../visitor";

const normalizeMultiplicationNode = (node: MultiplicationNode) => {
  const values = node.values;
  const factor = values.reduce(
    (factor, value) =>
      value.value.type === "value"
        ? value.operation === "*"
          ? factor * value.value.value
          : factor / value.value.value
        : factor,
    1
  );

  const normalizedValues = values.flatMap((value) =>
    value.value.type === "value"
      ? isNumber(value.value)
        ? []
        : [
            {
              ...value,
              operation: "*" as const,
              value: { ...value.value, value: 1 },
              text: stringifyNode({ ...value.value, value: 1 }),
            },
          ]
      : [{ ...value, text: stringifyNode(value.value) }]
  );
  //Find all parts of the multiplication that are not numbers
  const valuesWithWeight = normalizedValues.reduce(
    (acc, value) => ({
      ...acc,
      [value.text]: {
        content: value.value,
        count:
          (acc[value.text]?.count ?? 0) + (value.operation === "*" ? 1 : -1),
      },
    }),
    {} as Record<string, { count: number; content: Node }>
  );

  const fixedValues = Object.values(valuesWithWeight).flatMap(
    ({ count, content }) => [
      ...new Array(Math.abs(count)).fill(0).map(() => ({
        operation: count > 0 ? ("*" as const) : ("/" as const),
        value: content,
      })),
    ]
  );

  //   const deduplicatedNormalizedValues = normalizedValues.flatMap(
  //     (value, index) =>
  //       normalizedValues.findIndex(
  //         (checkValue) => checkValue.text === value.text
  //       ) === index
  //         ? [value]
  //         : []
  //   );
  //   // Count
  //   const duplicateValuesFactor = deduplicatedNormalizedValues.reduce(
  //     (acc, baseValue) =>
  //       acc *
  //       normalizedValues.filter((value) => value.text === baseValue.text).length,
  //     1
  //   );

  return {
    factor: factor,
    values: fixedValues,
  };
};

/** Move all factors in multiplications into a seperate value
 *
 * 2rem * 2 => 4 * 1rem
 *
 * Also deduplicates nodes in multiplications
 */
export const normalizeMultiplication = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "multiplication") {
      return node;
    }

    const normalizedValues = normalizeMultiplicationNode(node);

    return {
      ...node,
      values: [
        ...normalizedValues.values,
        {
          operation: "*" as const,
          value: {
            type: "value",
            unit: "number",
            value: normalizedValues.factor,
          },
        },
      ],
    };
  });
};
