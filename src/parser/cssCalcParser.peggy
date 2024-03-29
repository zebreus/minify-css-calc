// Css calc parser
// ==========================
//
// Only accepts numbers and allows for spaces everywhere
{
  const Big = require("big.js")
}

RootTemplate
  = content:RootTemplateContent {
    const result = {type: "var", value: text(), values: content.values, kind: "root"}
    // console.log(result)
    return result
    }

Value
  = Calc
  / Min
  / Max
  / Clamp
  / Number
  / CustomProperty

CalcPrefix
  = 'calc' { return text() }
  / '-' ([a-z]+) '-calc' { return text() }
  / 'expression' { return text() }

// Root calc
Calc
  = prefix:CalcPrefix "(" _ value:Value _ ")" { return { type: "calc", prefix: prefix, value: value } }
  / prefix:CalcPrefix "(" _ expr:Expression _ ")" { return { type: "calc", prefix: prefix, value: expr } }
  
Min
  = "min(" _ expr:Expression more:( _ "," _ Expression )* _ ")" {
      const values = [expr, ...more.map(element => element[3])]
      return {type: "min", values}
    }

Max
  = "max(" _ expr:Expression more:( _ "," _ Expression )* _ ")" {
      const values = [expr, ...more.map(element => element[3])]
      return {type: "max", values}
    }

Clamp
  = "clamp(" _ min:Expression _ "," _ value:Expression _ "," _ max:Expression  _ ")" {
      return {type: "clamp", min, value, max}
    }


Expression
  = head:Term tail:(_ ("+" / "-") _ Term)* {
      const terms = [{operation: "+", value: head}, ...tail.map(element => ({operation: element[1], value: element[3]}))]
      
      return {type: "addition", values: terms}
    }

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      const terms = [{operation: "*", value: head}, ...tail.map(element => ({operation: element[1], value: element[3]}))]
     return {type: "multiplication", values: terms}
    }

Factor
  = "(" _ expr:Expression _ ")" { return {type: "parenthesis", value: expr} }
  / Value

UnitSuffix
  = 'integer'
  / 'number'
  / '%'
  / 'cm'
  / 'mm'
  / 'Q'
  / 'in'
  / 'pc'
  / 'pt'
  / 'px'
  / 'em'
  / 'rem'
  / 'ex'
  / 'rex'
  / 'cap'
  / 'rcap'
  / 'ch'
  / 'rch'
  / 'ic'
  / 'ric'
  / 'lh'
  / 'rlh'
  / 'vw'
  / 'vh'
  / 'vi'
  / 'vb'
  / 'vmin'
  / 'vmax'
  / 'dvw'
  / 'dvh'
  / 'dvi'
  / 'dvb'
  / 'dvmin'
  / 'dvmax'
  / 'lvw'
  / 'lvh'
  / 'lvi'
  / 'lvb'
  / 'lvmin'
  / 'lvmax'
  / 'svw'
  / 'svh'
  / 'svi'
  / 'svb'
  / 'svmin'
  / 'svmax'
  / 'deg'
  / 'grad'
  / 'rad'
  / 'turn'
  / 's'
  / 'ms'
  / 'hz'
  / 'khz'
  / 'dpi'
  / 'dpcm'
  / 'dppx'
  / 'x'
  / ! [a-z]
  / ! { error("Unknown unit") ; return true }


Number "number"
  = number:$( _ [+-]? BaseNumber Exponent? ) unit:$(UnitSuffix?)  {
    return {type: "value", value: Big(number), unit: unit || "number" }; }

BaseNumber
  = [0-9]* "." [0-9]+ { return text() }
  / [0-9]+ { return text() }

Exponent
  = "e" [+-]? BaseNumber { return text() }

CustomPropertyPrefix
  = "var("
  / "env("
  / "constant("

CustomProperty
  = CustomPropertyPrefix content:TemplateContent {
    const result = {type: "var", value: text(), values: content.values, kind: "customProperty"}
    // console.log(result)
    return result
    }

//   CustomProperty
// = !"min(" !"max(" !"clamp(" !"calc(" ([a-z-]+) "(" content:TemplateContent {
//   const result = {type: "var", value: text(), values: content.values, kind: "customProperty"}
//   console.log(result)
//   return result
//   }

SpecialValue
  = Calc
  / Min
  / Max
  / Clamp
  / Number

TextValue
  = value:Value { return {value: value, text: text()}}

RootTextValue
  = value:Value { return {value: value, text: text()}}

RootTemplateContentSeparator
  = [^()+*/-] tc:RootTemplateContent {return {values: tc.values, value: text()}}
  / []* {return {values: {}, value: text()}}

RootTemplateContent
  = !([ \t\n\r]) value:TextValue tc:RootTemplateContentSeparator {return {values: {...tc.values, [value.text]: value.value}, value: text()}}
  / RootTemplateContentSeparator

TemplateContent
  = !([ \t\n\r]) value:TextValue tc:TemplateContent {return {values: {...tc.values, [value.text]: value.value}, value: text()}}
  / [^)] tc:TemplateContent {return {values: tc.values, value: text()}}
  / ")" {return {values: {}, value: text()}}

_ "whitespace"
  = [ \t\n\r]*