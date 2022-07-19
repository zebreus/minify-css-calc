import { OptimizerStorage } from "optimizeAst";
import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

export const detectCalcPrefixes = (
  node: Node,
  storage: OptimizerStorage
): Node => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "calc") {
        return node;
      }

      if (storage.knownCalcPrefixes?.includes(node.prefix ?? "calc")) {
        return node;
      }

      storage.knownCalcPrefixes = [
        ...(storage.knownCalcPrefixes ?? []),
        node.prefix ?? "calc",
      ];

      return node;
    }
  );
};
