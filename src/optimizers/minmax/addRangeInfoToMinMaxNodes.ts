import { compareValues } from "cssUnitFunctions";
import { reverseVisitor } from "reverseVisitor";
import {
  MaxNode,
  MinNode,
  MultiplicationNode,
  Node,
  ValueNode,
} from "../../parseCalc";
import { visitor } from "../../visitor";

const mapByUnit = (values: Array<ValueNode>) => {
  return values.reduce((acc, { value, unit }) => {
    if (!acc[unit]) {
      acc[unit] = [];
    }
    acc[unit].push(value);
    return acc;
  }, {} as Record<string, Array<number>>);
};

/**
 * If there is max statement inside a min statement, try to optimize that
 */
export const addRangeInfoToMinMaxStatements = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    switch (node.type) {
      case "value":
        return {
          ...node,
          rangeInfo: [
            {
              unit: node.unit,
              min: node.value,
              max: node.value,
            },
          ],
        } as ValueNode;
      case "min":
      case "max": {
        if (
          node.values.find(
            (child) => child.type !== "var" && child.rangeInfo === undefined
          ) ||
          !node.values.find((child) => child.type !== "var")
        ) {
          return node;
        }

        const rangeInfoNodes = node.values.flatMap((value) =>
          value.type === "value" ||
          value.type === (node.type === "max" ? "min" : "max")
            ? [value]
            : []
        );
        const varNodes = node.values.flatMap((value) =>
          value.type === "var" ? [value] : []
        );
        const hasVarNodes = !!varNodes.length;

        const rangeInfos = rangeInfoNodes.flatMap((value) => value.rangeInfo!);

        const varRangeInfos = hasVarNodes
          ? rangeInfos.map((rangeInfo) => ({
              ...rangeInfo,
              min: -Infinity,
              max: Infinity,
            }))
          : [];

        const reducedRangeInfos = rangeInfos.reduce(
          (newRangeInfos, rangeInfo) => {
            const sameUnitRange = newRangeInfos.find(
              (oldRangeInfo) => oldRangeInfo.unit === rangeInfo.unit
            );
            if (sameUnitRange) {
              const min =
                compareValues(
                  { unit: rangeInfo.unit, value: rangeInfo.min },
                  { unit: sameUnitRange.unit, value: sameUnitRange.min }
                ) === (node.type === "max" ? 1 : -1)
                  ? rangeInfo.min
                  : sameUnitRange.min;
              const max =
                compareValues(
                  { unit: rangeInfo.unit, value: rangeInfo.max },
                  { unit: sameUnitRange.unit, value: sameUnitRange.max }
                ) === (node.type === "max" ? 1 : -1)
                  ? rangeInfo.max
                  : sameUnitRange.max;
              return [
                ...newRangeInfos.filter(
                  (range) => range.unit !== rangeInfo.unit
                ),
                { unit: rangeInfo.unit, min, max },
              ];
            }
            return [...newRangeInfos, rangeInfo];
          },
          varRangeInfos
        );

        const canBeResolved = reducedRangeInfos.every(
          (rangeInfo) => rangeInfo.min === rangeInfo.max
        );

        if (canBeResolved) {
          if (reducedRangeInfos.length === 1) {
            return {
              ...node,
              type: "value",
              unit: reducedRangeInfos[0].unit,
              value: reducedRangeInfos[0].min,
              rangeInfo: reducedRangeInfos,
            };
          }
          return {
            ...node,
            values: reducedRangeInfos.map((rangeInfo) => ({
              type: "value",
              unit: rangeInfo.unit,
              value: rangeInfo.min,
            })),
            rangeInfo: reducedRangeInfos,
          };
        }

        return { ...node, rangeInfo: reducedRangeInfos };
        // const varNodes = node.values.flatMap((value) =>
        //   value.type === "var" ? [value] : []
        // );
      }
      default:
        return node;
    }
  });
};
