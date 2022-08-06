import Big from "big.js";
Big.DP = 40;
Big.RM = 2;

// const botchComparisons =
//   (name: "lt" | "lte" | "gt" | "gte" | "eq") =>
//   (a: Big | string | number, b: Big | string | number) => {
//     const bigA = typeof a === "object" ? a : new Big(a);
//     const bigB = typeof b === "object" ? b : new Big(b);
//     return bigA.prec(10, 0)[name](bigB.prec(10, 0));
//   };

// export const lt = botchComparisons("lt");
// export const lte = botchComparisons("lte");
// export const gt = botchComparisons("gt");
// export const gte = botchComparisons("gte");
// export const eq = botchComparisons("eq");

const botchBuildinComparison = (name: "lt" | "lte" | "gt" | "gte" | "eq") => {
  const oldName = "o_" + name;
  const old = Big.prototype[oldName] ?? Big.prototype[name];
  Big.prototype[oldName] = old;
  return function (this: any, b: Big | string | number) {
    const bigB = typeof b === "object" ? b : new Big(b);

    return this.prec(10)[oldName](bigB.prec(10));
  };
};

Big.prototype.lt = botchBuildinComparison("lt");
Big.prototype.lte = botchBuildinComparison("lte");
Big.prototype.gt = botchBuildinComparison("gt");
Big.prototype.gte = botchBuildinComparison("gte");
Big.prototype.eq = botchBuildinComparison("eq");

export const bigMin = (...args: (Big | number | string)[]) => {
  const bigs = args.map((arg) => (typeof arg === "object" ? arg : Big(arg)));
  return bigs.reduce((acc, cur) => (acc.lt(cur) ? acc : cur));
};

export const bigMax = (...args: (Big | number | string)[]) => {
  const bigs = args.map((arg) => (typeof arg === "object" ? arg : Big(arg)));
  return bigs.reduce((acc, cur) => (acc.gt(cur) ? acc : cur));
};

export { Big };
