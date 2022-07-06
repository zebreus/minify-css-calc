// Css calc parser
// ==========================
//
// Only accepts numbers and allows for spaces everywhere

{
  /** Converts all absolute units to pixels */
  const absoluteUnitLengths = {
    cm: 37.8,
    mm: 3.78,
    Q: 0.945,
    in: 96,
    pc: 16,
    pt: 96 / 72,
    px: 1,
  };
  const absoluteUnits = Object.keys(absoluteUnitLengths);
  const relativeUnits = [
  "em"
  , "ex"
  , "ch"
  , "rem"
  , "lh"
  , "rlh"
  , "vw"
  , "vh"
  , "vmin"
  , "vmax"
  , "vb"
  , "vi"
  , "svw"
  , "svh"
  , "lvw"
  , "lvh"
  , "dvw"
  , "dvh"
  , "%"
  ,]
  const allUnits = [...absoluteUnits, ...relativeUnits]
  const getUniformValue = ({ value, unit }) => {
    const multiplier = absoluteUnits.includes(unit)
      ? absoluteUnitLengths[unit]
      : 1;
    const newUnit = absoluteUnits.includes(unit) ? "px" : unit;
    return { value: multiplier * value, unit: newUnit };
  };

/** Get the string value wrapped in calc */
  const getStringValue = ({ value, unit }) => {
    if(value == 0){
      return "0"
    }
    if(allUnits.includes(unit)){
      return `${value}${unit}`
    }
    if(unit === "number"){
      return `${value}`
    }
    const newUnit = absoluteUnits.includes(unit) ? "px" : unit;
    return { value: multiplier * value, unit: newUnit };
  };
}

Value
  = Calc
  / Min
  / Max
  / Clamp
  / CustomProperty
  / Number

// Root calc
Calc
  = "calc(" _ expr:Value _ ")" { return expr }
  / "calc(" _ expr:Expression _ ")" { return typeof expr === "string" ? `calc(${expr})` : expr  }

CalcInCalc
  = "calc(" _ expr:Expression _ ")" { return expr  }
  
Min
  = "min(" _ expr:Value more:( _ "," _ Value )* _ ")" {
      const values = [expr, ...more.map(element => element[3])]
      const numbers = values.filter(value => typeof value === "number")
      const strings = values.filter(value => typeof value === "string")
      const lowestNumber = numbers.length
        ? numbers.reduce((result, value) => Math.min(result, value), numbers[0])
        : undefined
      if(strings.length){
        return `min(${strings.join(",")}${lowestNumber !== undefined ? `,${lowestNumber}` : ""})`
      }
      return lowestNumber
    }

Max
  = "max(" _ expr:Value more:( _ "," _ Value )* _ ")" {
      const values = [expr, ...more.map(element => element[3])]
      const numbers = values.filter(value => typeof value === "number")
      const strings = values.filter(value => typeof value === "string")
      const highestNumber = numbers.length
        ? numbers.reduce((result, value) => Math.max(result, value), numbers[0])
        : undefined
      if(strings.length){
        return `max(${strings.join(",")}${highestNumber !== undefined ? `,${highestNumber}` : ""})`
      }
      return highestNumber
    }

Clamp
  = "clamp(" _ min:Value _ "," _ pref:Value _ "," _ max:Value  _ ")" {
      const minString = typeof min === "string"
      const prefString = typeof pref === "string"
      const maxString = typeof max === "string"

      if(!minString && !prefString && !maxString){
        return Math.max(min, Math.min(max, pref))
      }
      if(minString && !prefString && !maxString){
        return `max(${min},${Math.min(pref,max)})`
      }
      if(!minString && prefString && !maxString){
        return min >= max ? min : `clamp(${min},${pref},${max})`
      }
      if(!minString && !prefString && maxString){
        return pref <= min ? min : `clamp(${min},${pref},${max})`
      }
      return `clamp(${min},${pref},${max})`
    }


Expression
  = head:Term tail:(_ ("+" / "-") _ Term)* {
      const terms = [{op: "+", value: head}, ...tail.map(element => ({op: element[1], value: element[3]}))]
      const numbers = terms.filter(term => typeof term.value === "number")
      const strings = terms.filter(term => typeof term.value === "string")

      const sum = numbers.reduce((result, term) =>
        (term.op === "+" ? (result + term.value) : (result - term.value))
      , 0);

      if(strings.length === 0){
        return sum
      }

      if(sum){
        return `${sum}${strings.map(term => ` ${term.op} ${term.value}`).join("")}`
      }

      const stringsPositiveFirst = [...strings.filter(term => term.op === "+"), ...strings.filter(term => term.op === "-")]

      return (stringsPositiveFirst[0].op === "-" ? "-1*" : "") + stringsPositiveFirst[0].value + stringsPositiveFirst.slice(1).map(term => ` ${term.op} ${term.value}`).join("")
    }

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      const terms = [{op: "*", value: head}, ...tail.map(element => ({op: element[1], value: element[3]}))]
      const numbers = terms.filter(term => typeof term.value === "number")
      const strings = terms.filter(term => typeof term.value === "string")

      const sum = numbers.reduce((result, term) =>
        (term.op === "+" ? (result + term.value) : (result - term.value))
      , 0);

      if(strings.length === 0){
        return sum
      }

      if(sum){
        return `${sum}${strings.map(term => ` ${term.op} ${term.value}`).join("")}`
      }

      const stringsPositiveFirst = [...strings.filter(term => term.op === "+"), ...strings.filter(term => term.op === "-")]

      return (stringsPositiveFirst[0].op === "-" ? "-1*" : "") + stringsPositiveFirst[0].value + stringsPositiveFirst.slice(1).map(term => ` ${term.op} ${term.value}`).join("")
    }
  // {
  //     return tail.reduce(function(result, element) {
  //       if (element[1] === "*") { return result * element[3]; }
  //       if (element[1] === "/") { return result / element[3]; }
  //     }, head);
  //   }

Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / CalcInCalc
  / Value

UnitSuffix
  = "cm"
  / "mm"
  / "Q"
  / "in"
  / "px"
  / "pc"
  / "pt"
  / "em"
  / "ex"
  / "ch"
  / "rem"
  / "lh"
  / "rlh"
  / "vw"
  / "vh"
  / "vmin"
  / "vmax"
  / "vb"
  / "vi"
  / "svw"
  / "svh"
  / "lvw"
  / "lvh"
  / "dvw"
  / "dvh"
  / "%"

Number "number"
  = number:$( _ [+-]? BaseNumber Exponent? ) unit:$(UnitSuffix?)  {
    return {value: parseFloat(number, 10), unit: unit || undefined }; }

BaseNumber
  = [0-9]* "." [0-9]+ { return text() }
  / [0-9]+ { return text() }

Exponent
  = "e" [+-]? BaseNumber { return text() }

CustomProperty
  = "var(" [^)]* ")" { return text() }

_ "whitespace"
  = [ \t\n\r]*