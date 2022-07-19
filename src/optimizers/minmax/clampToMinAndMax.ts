import { MultiplicationNode, Node } from "../../parseCalc";
import { visitor } from "../../visitor";

export const clampToMinAndMax = (node: Node) => {
  return visitor(
    node,
    (node) => node.type === "clamp",
    (node: Node) => {
      if (node.type !== "clamp") {
        throw new Error("This should always be a clamp node");
      }

      return {
        ...node,
        type: "max",
        values: [node.min, { type: "min", values: [node.value, node.max] }],
      };
    }
  );
};
