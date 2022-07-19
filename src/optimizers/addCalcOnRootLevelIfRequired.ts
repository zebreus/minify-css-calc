import {
  OptimizerFunction,
  OptimizerStage,
  OptimizerStorage,
} from "optimizeAst";
import { MultiplicationNode, Node } from "../parseCalc";
import { visitor } from "../visitor";

const transformRootNode = (node: Node, calcPrefix: string): Node => {
  const rootNode =
    node.type === "addition" || node.type === "multiplication"
      ? {
          type: "calc" as const,
          prefix: calcPrefix,
          value: node,
        }
      : node.type === "parenthesis"
      ? {
          ...node,
          type: "calc" as const,
          prefix: calcPrefix,
        }
      : node;

  return rootNode;
};

export const addCalcOnRootLevelIfRequired = (
  node: Node,
  storage: OptimizerStorage
): Node => {
  const calcPrefix =
    storage.knownCalcPrefixes?.find((prefix) => prefix !== "calc") ?? "calc";

  return visitor(
    transformRootNode(node, calcPrefix),
    () => true,
    (node: Node) => {
      if (node.type !== "var") {
        return node;
      }

      return {
        ...node,
        values: Object.fromEntries(
          Object.entries(node.values).map(([key, value]) => [
            key,
            transformRootNode(value, calcPrefix),
          ])
        ),
      };
    }
  );
};
