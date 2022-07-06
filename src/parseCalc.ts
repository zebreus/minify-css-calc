import peggy from "peggy";
import fs from "fs";
import path from "path";

const grammar = fs.readFileSync(
  path.resolve(__dirname, "./parsers/cssCalcParser.peggy"),
  "utf8"
);

const cssCalcParser = peggy.generate(grammar);

export const parseCalc = cssCalcParser.parse;
export const SyntaxError = cssCalcParser.SyntaxError;
