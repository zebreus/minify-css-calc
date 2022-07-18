import { parseCalc } from "parseCalc";
// @ts-ignore-error: The parser is generated during the build step
import { parse } from "parser/cssCalcParser";

export const minifyCSSCalc = (input: string): string => {
  return parseCalc(input, parse);
};

export default minifyCSSCalc;
