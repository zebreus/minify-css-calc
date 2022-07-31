import { debugNode, stringifyNode } from "stringifyNode";
import { MultiplicationNode, Node, ValueNode } from "../../parseCalc";
import { visitor } from "../../visitor";

/**
 * Remove units in a multiplication that cancel each other out
 */
const removeCancelledOutUnits = (
  node: MultiplicationNode
): MultiplicationNode => {
  const valueElements = node.values.flatMap((value) =>
    value.value.type === "value" ? [{ ...value, value: value.value }] : []
  );

  const otherElements = node.values.filter(
    (value) => value.value.type !== "value"
  );

  const unitCounter = valueElements.reduce(
    (acc, value) => ({
      ...acc,
      [value.value.unit]: {
        division: [
          ...(acc[value.value.unit]?.division ?? []),
          ...(value.operation === "/" ? [value.value] : []),
        ],
        multiplication: [
          ...(acc[value.value.unit]?.multiplication ?? []),
          ...(value.operation === "*" ? [value.value] : []),
        ],
      },
    }),
    {} as Record<string, { division: ValueNode[]; multiplication: ValueNode[] }>
  );

  const newValueElements = Object.entries(unitCounter).flatMap(
    ([unit, { division, multiplication }]) => {
      const cancelledOut = Math.min(division.length, multiplication.length);
      const elementsWithUnitsRemoved = [
        ...division.map((element, index) => ({
          operation: "/" as const,
          value:
            index < cancelledOut ? { ...element, unit: "number" } : element,
        })),
        ...multiplication.map((element, index) => ({
          operation: "*" as const,
          value:
            index < cancelledOut ? { ...element, unit: "number" } : element,
        })),
      ];
      return elementsWithUnitsRemoved;
    }
  );

  return { ...node, values: [...otherElements, ...newValueElements] };
};

/**
 * Remove units in a multiplication that cancel each other out
 */
const removeCancelledOutElements = (
  node: MultiplicationNode
): MultiplicationNode => {
  const elements = node.values.map((element) => ({
    text: stringifyNode(element.value),
    operation: element.operation,
    node: element.value,
  }));

  const sortedElements = elements.reduce(
    (acc, value) => ({
      ...acc,
      [value.text]: {
        division: [
          ...(acc[value.text]?.division ?? []),
          ...(value.operation === "/" ? [value.node] : []),
        ],
        multiplication: [
          ...(acc[value.text]?.multiplication ?? []),
          ...(value.operation === "*" ? [value.node] : []),
        ],
      },
    }),
    {} as Record<string, { division: Node[]; multiplication: Node[] }>
  );

  const newValueElements = Object.entries(sortedElements).flatMap(
    ([unit, { division, multiplication }]) => {
      const cancelledOut = Math.min(division.length, multiplication.length);
      const elementsWithUnitsRemoved = [
        ...division
          .slice(cancelledOut)
          .map((element) => ({ operation: "/", value: element } as const)),
        ...multiplication
          .slice(cancelledOut)
          .map((element) => ({ operation: "*", value: element } as const)),
      ];
      return elementsWithUnitsRemoved;
    }
  );

  return { ...node, values: newValueElements };
};

const moveAllFactorIntoASingleNumber = (
  node: MultiplicationNode
): MultiplicationNode => {
  const valueElements = node.values.flatMap((value) =>
    value.value.type === "value" ? [{ ...value, value: value.value }] : []
  );

  const otherElements = node.values.filter(
    (value) => value.value.type !== "value"
  );

  const globalFactor = valueElements.reduce(
    (factor, element) =>
      factor *
      (element.operation === "*"
        ? element.value.value
        : 1 / element.value.value),
    1
  );

  const normalizedValueElements = valueElements
    .filter((element) => element.value.unit !== "number")
    .map((element) => ({ ...element, value: { ...element.value, value: 1 } }));

  const newValueElements = [
    {
      operation: "*",
      value: { type: "value", value: globalFactor, unit: "number" },
    } as const,
    ...normalizedValueElements,
    ...otherElements,
  ];

  return { ...node, values: newValueElements };
};

const ensureNoDivisionByZero = (
  node: MultiplicationNode
): MultiplicationNode => {
  const zeroDivisions = node.values.forEach((value) => {
    if (
      value.value.type === "value" &&
      value.operation === "/" &&
      value.value.value === 0
    ) {
      throw new Error(`Division by zero in ${stringifyNode(node)}`);
    }
  });

  return node;
};

const integrateUnitlessNodeIntoUnitNode = (
  node: MultiplicationNode
): MultiplicationNode => {
  const valueElements = node.values.flatMap((value) =>
    value.value.type === "value" ? [{ ...value, value: value.value }] : []
  );

  const otherElements = node.values.filter(
    (value) => value.value.type !== "value"
  );

  const unitlessNodes = valueElements.filter(
    (element) => element.value.unit === "number"
  );

  const unitlessFactor = unitlessNodes.reduce(
    (factor, element) =>
      factor *
      (element.operation === "*"
        ? element.value.value
        : 1 / element.value.value),
    1
  );

  const newNodeBase =
    valueElements.find(
      (element) => element.value.unit !== "number" && element.operation === "*"
    ) ||
    ({
      operation: "*",
      value: { type: "value", value: 1, unit: "number" },
    } as const);

  const factor =
    newNodeBase.value.value *
    (newNodeBase.operation === "*" ? unitlessFactor : 1 / unitlessFactor);

  const newNode = {
    ...newNodeBase,
    value: { ...newNodeBase.value, value: factor },
  };

  const remainingElements = [
    ...valueElements.filter(
      (element) => element !== newNodeBase && element.value.unit !== "number"
    ),
    ...otherElements,
  ];

  const newValueElements = [newNode, ...remainingElements];

  return { ...node, values: newValueElements };
};

const removeMultiplicationIdentity = (
  node: MultiplicationNode
): MultiplicationNode => {
  const filteredValues = node.values.filter(
    (value) =>
      !(
        value.value.type === "value" &&
        value.value.unit === "number" &&
        value.value.value === 1
      )
  );

  if (filteredValues.length === 0) {
    return {
      ...node,
      values: [
        { operation: "*", value: { type: "value", value: 1, unit: "number" } },
      ],
    };
  }

  return { ...node, values: filteredValues };
};

const removeUnneccessaryMultiplication = (node: MultiplicationNode): Node => {
  if (
    node.values.find(
      (element) => element.value.type === "value" && element.value.value === 0
    )
  ) {
    return {
      ...node,
      type: "value",
      unit: "number",
      value: 0,
    };
  }
  if (node.values.length === 1 && node.values[0].operation === "*") {
    return node.values[0].value;
  }
  if (node.values.length === 0) {
    return {
      ...node,
      type: "value",
      unit: "number",
      value: 1,
    };
  }
  return node;
};

/**
 * All multiplication optimizations, that do not look into children other then value nodes
 */
export const evaluateBasicMultiplication = (node: Node) => {
  return visitor(
    node,
    () => true,
    (node: Node) => {
      if (node.type !== "multiplication") {
        return node;
      }

      const stage1 = removeCancelledOutUnits(node);
      const stage11 = removeCancelledOutElements(stage1);
      const stage12 = ensureNoDivisionByZero(stage11);
      const stage2 = moveAllFactorIntoASingleNumber(stage12);
      const stage3 = integrateUnitlessNodeIntoUnitNode(stage2);
      const stage4 = removeMultiplicationIdentity(stage3);
      const stage5 = removeUnneccessaryMultiplication(stage4);

      return stage5;
    }
  );
};
