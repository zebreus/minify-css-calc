import { convertToCanonicalUnit, unitTypes } from "cssUnitFunctions";
import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const convertAbsoluteUnitsToCanonicalUnits = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "value") {
        return node;
      }

      const canonicalUnit = convertToCanonicalUnit(node);

      return {
        ...node,
        ...canonicalUnit,
      };
    }
  );
};
