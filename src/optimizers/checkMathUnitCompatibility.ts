import {
  checkAdditionCompatibility,
  checkMinMaxCompatibility,
  checkMultiplicationCompatibility,
  checkValidDivider as checkValidDivisor,
  getCompatibleUnits,
  unitTypes,
} from "cssUnitFunctions";
import { reverseVisitor } from "reverseVisitor";
import { MultiplicationNode, Node, ValueNode } from "../parseCalc";
import { visitor } from "../visitor";

const throwError = (node: Node, message: string) => {
  throw new Error(`${message} at node ${JSON.stringify(node)}`);
};

export const checkMathUnitCompatibility = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    switch (node.type) {
      case "var":
        return {
          ...node,
          possibleUnits: [...unitTypes],
        };
      case "addition": {
        const values = node.values.map((value) => value.value);
        const elements = values.map((value) =>
          value.type === "value"
            ? value
            : value.possibleUnits ||
              throwError(value, "No possible units available")
        );
        const possibleUnits = checkAdditionCompatibility(...elements);
        if (possibleUnits.length === 0) {
          throwError(node, "Invalid unit");
        }
        return { ...node, possibleUnits };
      }
      case "multiplication": {
        const values = node.values.map((value) => value.value);
        const elements = values.map((value) =>
          value.type === "value"
            ? value
            : value.possibleUnits ||
              throwError(value, "No possible units available")
        );
        const possibleUnits = checkMultiplicationCompatibility(...elements);
        if (possibleUnits.length === 0) {
          throwError(node, "Invalid unit");
        }

        const divisors = node.values
          .filter((value) => value.operation === "/")
          .map((value) => value.value);
        const divisorElements = divisors.map((value) =>
          value.type === "value"
            ? value
            : value.possibleUnits ||
              throwError(value, "No possible units available")
        );
        divisorElements.forEach(
          (element, index) =>
            checkValidDivisor(element) ||
            throwError(divisors[index], "A divisor has to be a nonzero number")
        );

        return { ...node, possibleUnits };
      }
      case "min":
      case "max": {
        const elements = node.values.map((value) =>
          value.type === "value"
            ? { unit: value.unit, value: value.value }
            : value.possibleUnits ||
              throwError(value, "No possible units available")
        );
        const possibleUnits = checkMinMaxCompatibility(...elements);
        if (possibleUnits.length === 0) {
          throwError(node, "Invalid unit");
        }
        return { ...node, possibleUnits };
      }
      case "clamp":
        throwError(node, "Clamp nodes should be removed before unit check");
      case "parenthesis":
      case "calc":
        return { ...node, possibleUnits: node.value.possibleUnits };
      case "value":
        return {
          ...node,
          possibleUnits: getCompatibleUnits(node),
        };
      default:
        const x: never = node;
        return node;
    }

    // if(node.type === "addition") {
    //     const possibleUnits =
    //     return {
    //         ...node,

    //     }
    // }

    // const calculatedNodes = node.values.map()
  });
};
