import { Node } from "parseCalc";

type VisitorOptions = {
  /** Don't visit the children if the node has been visited by visit */
  dontVisitChildrenAgain?: boolean;
};

export const visitor = (
  node: Node,
  checkVisit: (node: Node) => boolean,
  visit: (node: Node) => Node,
  options?: VisitorOptions
): Node => {
  const visitNode = checkVisit(node);
  const newNode = visitNode ? visit(node) : node;

  if (visitNode && options?.dontVisitChildrenAgain) {
    return newNode;
  }

  const thisVisitor = (node: Node) => visitor(node, checkVisit, visit);
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
