import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const stripOptionalInformation = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      delete node.possibleUnits;
      delete node.rangeInfo;
      return node;
    }
  );
};
