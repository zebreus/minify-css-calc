import { parseCalc } from "../parseCalc";
import peggy from "peggy";
import fs from "fs";
import path from "path";

const grammar = fs.readFileSync(
  path.resolve(__dirname, "../parser/cssCalcParser.peggy"),
  "utf8"
);

const cssCalcParser = peggy.generate(grammar);

export const runParser = (input: string) =>
  parseCalc(input, cssCalcParser.parse);
