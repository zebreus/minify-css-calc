import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

const absoluteUnitLengths = {
  cm: 37.8,
  mm: 3.78,
  Q: 0.945,
  in: 96,
  pc: 16,
  pt: 1.33333333333333333,
  px: 1,
} as const;
const absoluteUnits = Object.keys(absoluteUnitLengths) as Array<
  keyof typeof absoluteUnitLengths
>;

export const convertAbsoluteUnitsToPixels = (node: Node) => {
  return visitor(
    node,
    (node) => node.type === "value",
    (node: Node) => {
      if (node.type !== "value") {
        throw new Error("Node needs to be a value");
      }

      if (absoluteUnits.includes(node.unit as typeof absoluteUnits[0])) {
        return {
          ...node,
          value:
            node.value *
            absoluteUnitLengths[node.unit as typeof absoluteUnits[0]],
          unit: "px",
        };
      }

      return node;
    }
  );
};
