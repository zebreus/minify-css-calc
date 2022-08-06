import Big from "big.js";
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
        ? acc.mul(element.value.value)
        : acc.div(element.value.value),
    Big(1)
  );

  const allNonFactorNodes = [
    ...factorNodes
      .filter((element) => element.value.unit !== "number")
      .map((element) => ({
        ...element,
        value: { ...element.value, value: Big(1) },
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
              value: Big(1),
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
        factor: thing.factor.mul(value.operation === "+" ? 1 : -1),
      };
    });

    const summedValues = values.reduce((acc, value) => {
      const existingValue = acc.find((element) => element.text === value.text);
      if (existingValue) {
        existingValue.factor = existingValue.factor.add(value.factor);
      } else {
        acc.push(value);
      }
      return acc;
    }, [] as typeof values);

    const valuesWithoutZeros = summedValues.filter(
      (value) => !value.factor.eq(0)
    );

    const valuesWithIntegratedFactors = valuesWithoutZeros.map((value) => ({
      operation: value.factor.gte(0) ? ("+" as const) : ("-" as const),
      value: {
        ...value.value,
        values: [
          ...value.value.values,
          {
            operation: "*" as const,
            value: {
              type: "value" as const,
              unit: "number" as const,
              value: value.factor.abs(),
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
              value: Big(0),
            },
          },
        ];

    return { ...node, values: newValues };
  });
};
