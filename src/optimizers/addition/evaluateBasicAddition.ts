import { MultiplicationNode, Node, ValueNode } from "../../parseCalc";
import { visitor } from "../../visitor";

export const evaluateBasicAddition = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "addition") {
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
                operation: "+" | "-";
                value: ValueNode;
              }
            | undefined;
          if (!oldValueNode) {
            return [...calculatedValues, value];
          }
          const oldValue =
            oldValueNode.operation === "+"
              ? oldValueNode.value.value
              : -oldValueNode.value.value;
          const valueValue =
            value.operation === "+" ? value.value.value : -value.value.value;

          const newValue = oldValue + valueValue;
          oldValueNode.operation = newValue >= 0 ? "+" : "-";
          oldValueNode.value.value = Math.abs(newValue);
          return calculatedValues;
        }
        return [...calculatedValues, value];
      }, [] as typeof node.values);

      return { ...node, values: calculatedNodes };
    }
  );
};
