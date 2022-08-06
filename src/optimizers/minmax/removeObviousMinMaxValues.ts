import Big from "big.js";
import { bigMax, bigMin } from "bigWrapper";
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
  }, {} as Record<string, Array<Big>>);
};

/**
 * If there are multiple values with the same unit in a min/max node, just use the min/max of the values.
 */
export const removeObviousMinMaxValues = (node: Node) => {
  return visitor(
    node,
    (node) => node.type === "min" || node.type === "max",
    (node: Node) => {
      if (node.type !== "min" && node.type !== "max") {
        throw new Error("This should always be a min node");
      }

      const valueNodes = node.values.flatMap((value) =>
        value.type === "value" ? [value] : []
      );

      const otherNodes = node.values.flatMap((value) =>
        value.type !== "value" ? [value] : []
      );

      const valuesByUnit = mapByUnit(valueNodes);

      const bestValues = Object.entries(valuesByUnit).map(([unit, values]) => ({
        type: "value" as const,
        unit: unit,
        value: values.reduce(
          (acc, value) => (node.type === "min" ? bigMin : bigMax)(acc, value),
          values[0]
        ),
      }));

      const newValues = [...bestValues, ...otherNodes];

      if (newValues.length === 1) {
        return newValues[0];
      }

      return {
        ...node,
        values: newValues,
      };
    }
  );
};
