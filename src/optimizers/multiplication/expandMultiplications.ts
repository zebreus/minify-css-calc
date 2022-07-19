import { compareValues } from "cssUnitFunctions";
import { reverseVisitor } from "reverseVisitor";
import {
  AdditionNode,
  MultiplicationNode,
  Node,
  ValueNode,
} from "../../parseCalc";
import { visitor } from "../../visitor";

/**
 * Convert multiplications to the expanded form
 *
 * (a+b) * (c+d) => a*c + a*d + b*c + b*d
 * (a+b) * (x+y) / (c+d) / f = (ax+ay+bx+by) / (cf+df)
 * (ax+ay+bx+by) / (cf+df) =>
 * ax/(cf+df) =>
 */
export const expandMultiplications = (node: Node) => {
  return reverseVisitor(node, (node: Node) => {
    if (node.type !== "multiplication") {
      return node;
    }

    const multiplicationNodes = node.values
      .filter((value) => value.operation === "*")
      .map((value) => value.value);

    const divisionNodes = node.values
      .filter((value) => value.operation === "/")
      .map((value) => value.value);

    const multiplicationComponents = multiplicationNodes
      .map((node) =>
        node.type === "parenthesis" || node.type === "calc" ? node.value : node
      )
      .map((node) =>
        node.type === "addition"
          ? node.values
          : [{ operation: "+" as const, value: node as Node }]
      );

    // const divisionComponents = divisionNodes
    //   .map((node) => ((node.type === "parenthesis" || node.type === "calc") ? node.value : node))
    //   .map((node) =>
    //     node.type === "addition"
    //       ? node.values
    //       : [{ operation: "+" as const, value: node as Node }]
    //   );

    const multNodes = multiplicationComponents.reduce(
      (acc, components) => {
        return acc.flatMap((oldSum) =>
          components.map((component) => ({
            operation:
              component.operation === oldSum.operation
                ? ("+" as const)
                : ("-" as const),
            values: [...oldSum.values, component.value],
          }))
        );
      },
      [
        {
          operation: "+",
          values: [],
        },
      ] as { operation: "+" | "-"; values: Node[] }[]
    );

    // const divNodes = divisionComponents.reduce(
    //   (acc, components) => {
    //     return acc.flatMap((oldSum) =>
    //       components.map((component) => ({
    //         operation:
    //           component.operation === oldSum.operation
    //             ? ("+" as const)
    //             : ("-" as const),
    //         values: [...oldSum.values, component.value],
    //       }))
    //     );
    //   },
    //   [
    //     {
    //       operation: "+",
    //       values: [],
    //     },
    //   ] as { operation: "+" | "-"; values: Node[] }[]
    // );

    // const multiplicationSum: AdditionNode | undefined =
    //   multNodes.length === 0
    //     ? undefined
    //     : {
    //         type: "addition",
    //         values: multNodes.map((multNode) => ({
    //           operation: multNode.operation,
    //           value: {
    //             type: "multiplication",
    //             values: [
    //               ...multNode.values.map(
    //                 (value) => ({ operation: "*", value } as const)
    //               ),
    //             ],
    //           },
    //         })),
    //       };

    // const divisionSum: AdditionNode | undefined =
    //   divNodes.length === 0
    //     ? undefined
    //     : {
    //         type: "addition",
    //         values: divNodes.map((divNode) => ({
    //           operation: divNode.operation,
    //           value: {
    //             type: "multiplication",
    //             values: [
    //               ...divNode.values.map(
    //                 (value) => ({ operation: "*", value } as const)
    //               ),
    //             ],
    //           },
    //         })),
    //       };

    // const resultNode: Node | undefined = divisionSum
    //   ? {
    //       type: "multiplication",
    //       values: [
    //         ...(multiplicationSum
    //           ? [{ operation: "*" as const, value: multiplicationSum }]
    //           : []),
    //         { operation: "/", value: divisionSum },

    //       ],
    //     }
    //   : multiplicationSum;

    const resultNode: AdditionNode | undefined =
      multNodes.length === 0
        ? undefined
        : {
            type: "addition",
            values: multNodes.map((multNode) => ({
              operation: multNode.operation,
              value: {
                type: "multiplication",
                values: [
                  ...multNode.values.map(
                    (value) => ({ operation: "*", value } as const)
                  ),
                  ...divisionNodes.map((node) => ({
                    operation: "/" as const,
                    value: node,
                  })),
                ],
              },
            })),
          };

    if (!resultNode) {
      throw new Error(`Failed to expand node ${node}`);
    }

    return resultNode;
  });
};
