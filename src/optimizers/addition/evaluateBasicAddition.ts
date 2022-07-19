import { MultiplicationNode, Node, ValueNode } from "../../parseCalc";
import { visitor } from "../../visitor";
import { addValueNodesInAddition } from "./basic/addValueNodesInAddition";
import { removeUnneccessaryAddition } from "./basic/removeUnnecessaryAddition";
import { removeAdditionIdentity } from "./removeAdditionIdentity";

export const evaluateBasicAddition = [
  addValueNodesInAddition,
  removeAdditionIdentity,
  removeUnneccessaryAddition,
];
