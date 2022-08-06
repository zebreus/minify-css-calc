import Big from "big.js";
import { MultiplicationNode, Node, ValueNode } from "../../parseCalc";
import { visitor } from "../../visitor";

export const evaluateBasicMultiplication = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "multiplication") {
        return node;
      }

      const calculatedNodes = node.values.reduce((calculatedValues, value) => {
        if (value.value.type === "value") {
          const oldValueNode = calculatedValues.find(
            (calculatedValue) =>
              calculatedValue.value.type === "value" &&
              calculatedValue.value.unit === (value.value as ValueNode).unit
          ) as
            | {
                operation: "*" | "/";
                value: ValueNode;
              }
            | undefined;
          if (!oldValueNode) {
            return [...calculatedValues, value];
          }
          const oldValue =
            oldValueNode.operation === "*"
              ? oldValueNode.value.value
              : Big(1).div(oldValueNode.value.value);
          const valueValue =
            value.operation === "*"
              ? value.value.value
              : Big(1).div(value.value.value);

          const newValue = oldValue.mul(valueValue);
          oldValueNode.operation = "*";
          oldValueNode.value.value = newValue;
          return calculatedValues;
        }
        return [...calculatedValues, value];
      }, [] as typeof node.values);

      return { ...node, values: calculatedNodes };
    }
  );
};
