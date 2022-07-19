import { MultiplicationNode, Node } from "../../parseCalc";
import { visitor } from "../../visitor";

export const integrateNestedMinMaxNodes = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "min" && node.type !== "max") {
        return node;
      }

      return {
        ...node,
        values: [
          ...node.values.filter((valueNode) => valueNode.type !== node.type),
          ...node.values.flatMap((valueNode) =>
            valueNode.type === node.type ? valueNode.values : []
          ),
        ],
      };
    }
  );
};
