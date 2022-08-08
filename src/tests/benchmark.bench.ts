import { benchmarkSuite } from "@zebreus/jest-bench";
import { runParser } from "./runParser";

benchmarkSuite("Benchmark minify", {
  ["Single number"]: () => {
    runParser("calc(15px + 15px)");
  },

  ["Simple expression"]: () => {
    runParser("calc(15px + 15px)");
  },

  ["Complex expression"]: () => {
    runParser("calc(14px + 6 * ((100vw - 320px) / 448))");
  },

  ["Really complex expression"]: () => {
    runParser(
      "calc( clamp(0, calc( ( max(calc(255/255), calc(0/255), calc(0/255)) - min(calc(255/255), calc(0/255), calc(0/255)) ) * 10e99 ), 1) * ( ( max(calc(255/255), calc(0/255), calc(0/255)) - min(calc(255/255), calc(0/255), calc(0/255)) ) / ( ( clamp( 0, calc( ( 0.5 - calc( ( max(calc(255/255), calc(0/255), calc(0/255)) + min(calc(255/255), calc(0/255), calc(0/255)) ) / 2 ) + 10e-30 ) * 1e30 ), 1 ) * ( max(calc(255/255), calc(0/255), calc(0/255)) + min(calc(255/255), calc(0/255), calc(0/255)) + 10e-30 ) ) + ( clamp( 0, calc( ( calc( ( max(calc(255/255), calc(0/255), calc(0/255)) + min(calc(255/255), calc(0/255), calc(0/255)) ) / 2 ) - 0.5 ) * 1e30 ), 1 ) * ( 2 - max(calc(255/255), calc(0/255), calc(0/255)) - min(calc(255/255), calc(0/255), calc(0/255)) + 10e-20 ) ) ) ) )"
    );
  },

  ["Simple expression with vars"]: () => {
    runParser("calc(10px - (100px - var(--mouseX)))");
  },
});
