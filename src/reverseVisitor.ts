import { Node } from "parseCalc";

export const reverseVisitor = (
  node: Node,
  visit: (node: Node) => Node
): Node => {
  const thisVisitor = (node: Node) => reverseVisitor(node, visit);

  const getNode = (newNode: Node) => {
    switch (newNode.type) {
      case "value":
        return newNode;
      case "min":
      case "max":
        return {
          ...newNode,
          values: newNode.values.map((value) => thisVisitor(value)),
        };
      case "clamp":
        return {
          ...newNode,
          min: thisVisitor(newNode.min),
          value: thisVisitor(newNode.value),
          max: thisVisitor(newNode.max),
        };
      case "parenthesis":
        return { ...newNode, value: thisVisitor(newNode.value) };
      case "addition":
        return {
          ...newNode,
          values: newNode.values.map((node) => ({
            ...node,
            value: thisVisitor(node.value),
          })),
        };
      case "multiplication":
        return {
          ...newNode,
          values: newNode.values.map((node) => ({
            ...node,
            value: thisVisitor(node.value),
          })),
        };
      case "calc":
        return { ...newNode, value: thisVisitor(newNode.value) };
      case "var":
        return newNode;
      default:
        const x: never = newNode;
        throw new Error("Node has unknown type");
    }
  };
  const nodeToVisit = getNode(node);
  const newNode = visit(nodeToVisit);

  return newNode;
};
