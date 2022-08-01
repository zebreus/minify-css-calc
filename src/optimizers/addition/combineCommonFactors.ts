import { reverseVisitor } from "reverseVisitor";
import { cleanStringifyNode } from "../../parseCalc";
import { AdditionNode, MultiplicationNode, Node } from "../../parseCalc";
import { visitor } from "../../visitor";

const groupPermutations = <T>(values: Array<T>): Array<Array<Array<T> | T>> => {
  if (values.length === 1) {
    return [[values[0]]];
  }
  if (values.length === 2) {
    return [[values[0], values[1]], [[values[0], values[1]]]];
  }
  const [current, ...rest] = values;
  const rec = groupPermutations(rest);

  const alpha = rec.map((values) => [current, ...values]);
  const beta = rec.flatMap((values) =>
    values.map((thing, index) => {
      const newValues = [...values];
      const addCurrentToThis = newValues[index];
      newValues[index] = Array.isArray(addCurrentToThis)
        ? [current, ...addCurrentToThis]
        : [current, addCurrentToThis];
      return newValues;
    })
  );
  return [...alpha, ...beta];
};

type NodeWithInfo = {
  values: {
    text: string;
    value: Node;
    operation: "*" | "/";
  }[];
  type: "multiplication";
  operation: "+" | "-";
};

const constructPermutation = (
  nodes: Array<NodeWithInfo>,
  permutation: Array<number | Array<number>>
): Node => {
  const parts: Array<AdditionNode["values"]> = permutation.map(
    (groupConfiguration) => {
      if (typeof groupConfiguration === "number") {
        const node = nodes[groupConfiguration];
        return [{ operation: node.operation, value: node }];
      }
      const groupNodes = groupConfiguration.map((index) => nodes[index]);
      const textArrays = groupNodes.map((node) =>
        node.values.map((value) => value.text)
      );
      const commonNames = textArrays.reduce((commonNames, texts) =>
        commonNames.filter((name) => texts.includes(name))
      );

      if (commonNames.length === 0) {
        return groupNodes.map((node) => ({
          operation: node.operation,
          value: node,
        }));
      }

      const nodesWithoutCommon = groupNodes.map((node) => ({
        ...node,
        values: node.values.filter(
          (value) => !commonNames.includes(value.text)
        ),
      }));
      const commonNode: MultiplicationNode = {
        type: "multiplication" as const,
        values: groupNodes[0].values.filter((value) =>
          commonNames.includes(value.text)
        ),
      };

      const result: AdditionNode["values"] = [
        {
          operation: "+" as const,
          value: {
            type: "multiplication" as const,
            values: [
              {
                operation: "*" as const,
                value: commonNode,
              },
              {
                operation: "*" as const,
                value: {
                  type: "addition" as const,
                  values: nodesWithoutCommon.map((node) => ({
                    operation: node.operation,
                    value: node.values.length
                      ? node
                      : {
                          type: "value" as const,
                          unit: "number" as const,
                          value: 1,
                        },
                  })),
                },
              },
            ],
          },
        },
      ];
      return result;
    }
  );

  const baseNode: AdditionNode = { type: "addition", values: parts.flat() };
  return baseNode;
};

export const addTexts = <T extends MultiplicationNode>(value: T) => {
  return {
    ...value,
    values: value.values.map((element) => ({
      ...element,
      text: element.operation + cleanStringifyNode(element.value),
    })),
  };
};

export const combineCommonFactors = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "addition") {
      return node;
    }

    const syntheticMultiplicationNodes: (MultiplicationNode & {
      operation: "+" | "-";
    })[] = node.values.map((element) =>
      element.value.type === "multiplication"
        ? {
            ...element.value,
            values: [...element.value.values],
            operation: element.operation,
          }
        : {
            type: "multiplication",
            values: [{ operation: "*" as const, value: element.value }],
            operation: element.operation,
          }
    );

    const nodesWithTexts = syntheticMultiplicationNodes.map((value) => ({
      ...value,
      values: value.values.map((element) => ({
        ...element,
        text: element.operation + cleanStringifyNode(element.value),
      })),
    }));

    const permutations = groupPermutations(
      new Array(nodesWithTexts.length).fill(0).map((v, i) => i)
    );

    const allPossibleConstructs = permutations.map((permutation) =>
      constructPermutation(nodesWithTexts, permutation)
    );

    const allPossibleConstructsWithTexts = allPossibleConstructs.map(
      (value) => ({
        ...value,
        text: cleanStringifyNode(value),
      })
    );

    const shortestTextLength = allPossibleConstructsWithTexts.reduce(
      (shortest, value) =>
        value.text.length < shortest ? value.text.length : shortest,
      Infinity
    );

    const shortestConstruct = allPossibleConstructsWithTexts.find(
      (node) => node.text.length === shortestTextLength
    );

    if (!shortestConstruct) {
      throw new Error("Should not happen");
    }

    return shortestConstruct;
  });
};
