import { MultiplicationNode, Node } from "../../parseCalc";
import { visitor } from "../../visitor";

export const minAndMaxToClamp = (node: Node) => {
  return visitor(
    node,
    (node) => node.type === "max",
    (node: Node) => {
      if (node.type !== "max") {
        throw new Error("This should always be a clamp node");
      }

      if (
        node.values.length === 2 &&
        node.values[0].type === "min" &&
        node.values[0].values.length === 2
      ) {
        return {
          ...node,
          type: "clamp",
          min: node.values[1],
          value: node.values[0].values[0],
          max: node.values[0].values[1],
        };
      }
      if (
        node.values.length === 2 &&
        node.values[1].type === "min" &&
        node.values[1].values.length === 2
      ) {
        return {
          ...node,
          type: "clamp",
          min: node.values[0],
          value: node.values[1].values[0],
          max: node.values[1].values[1],
        };
      }

      return node;
    }
  );
};
