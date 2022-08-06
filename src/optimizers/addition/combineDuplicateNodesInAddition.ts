import { compareValues, isNumber } from "cssUnitFunctions";
import { reverseVisitor } from "reverseVisitor";
import { stringifyNode } from "stringifyNode";
import {
  AdditionNode,
  cleanStringifyNode,
  MultiplicationNode,
  Node,
  ValueNode,
} from "../../parseCalc";
import { visitor } from "../../visitor";

const extractFactor = (value: Node) => {
  // if (value.type !== "value" && value.type !== "multiplication") {
  //   return {
  //     value: value,
  //     factor: 1,
  //     text: cleanStringifyNode(value),
  //     operation: "+" as const,
  //   };
  // }

  const factorNodes =
    value.type === "value"
      ? [{ operation: "*" as const, value: value }]
      : value.type === "multiplication"
      ? value.values.flatMap((element) =>
          element.value.type === "value"
            ? [{ ...element, value: element.value }]
            : []
        )
      : [];

  const nonFactorNodes =
    value.type === "value"
      ? []
      : value.type === "multiplication"
      ? value.values.flatMap((element) =>
          element.value.type !== "value"
            ? [{ ...element, value: element.value }]
            : []
        )
      : [{ operation: "*" as const, value: value }];

  const factor = factorNodes.reduce(
    (acc, element) =>
      element.operation === "*"
        ? acc * element.value.value
        : acc / element.value.value,
    1
  );

  const allNonFactorNodes = [
    ...factorNodes
      .filter((element) => element.value.unit !== "number")
      .map((element) => ({
        ...element,
        value: { ...element.value, value: 1 },
      })),
    ...nonFactorNodes,
  ];

  const newMultiplicationNode: Node = allNonFactorNodes.length
    ? {
        ...value,
        type: "multiplication" as const,
        values: nonFactorNodes,
      }
    : {
        type: "multiplication" as const,
        values: [
          {
            operation: "*" as const,
            value: {
              type: "value" as const,
              unit: "number" as const,
              value: 1,
            },
          },
        ],
      };

  return {
    factor: factor,
    value: newMultiplicationNode,
    text: cleanStringifyNode(newMultiplicationNode),
    operation: "+" as const,
  };
};

/** Move all factors in multiplications into a seperate value
 *
 * var(--a) + var(--a) + 2 => var(--a)*2 + 2
 * var(--a) + 2*var(--a) + 2 => var(--a)*3 + 2
 *
 * This is quite buggy and can be replaced by combineCommonFactors
 * You should integrate additions before this
 * You should evalutate factors in multiplications after this
 */
export const combineDuplicateNodesInAddition = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "addition") {
      return node;
    }

    const values = node.values.map((value) => {
      const thing = extractFactor(value.value);
      return {
        ...thing,
        factor: (value.operation === "+" ? 1 : -1) * thing.factor,
      };
    });

    const summedValues = values.reduce((acc, value) => {
      const existingValue = acc.find((element) => element.text === value.text);
      if (existingValue) {
        existingValue.factor += value.factor;
      } else {
        acc.push(value);
      }
      return acc;
    }, [] as typeof values);

    const valuesWithoutZeros = values.filter((value) => value.factor !== 0);

    const valuesWithIntegratedFactors = values.map((value) => ({
      operation: value.factor >= 0 ? ("+" as const) : ("-" as const),
      value: {
        ...value.value,
        values: [
          ...value.value.values,
          {
            operation: "*" as const,
            value: {
              type: "value" as const,
              unit: "number" as const,
              value: Math.abs(value.factor),
            },
          },
        ],
      },
    }));

    const newValues = valuesWithIntegratedFactors.length
      ? valuesWithIntegratedFactors
      : [
          {
            operation: "+" as const,
            value: {
              type: "value" as const,
              unit: "number" as const,
              value: 0,
            },
          },
        ];

    return { ...node, values: newValues };
  });
};
