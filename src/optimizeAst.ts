import { UnitType } from "cssUnitFunctions";
import { Node } from "parseCalc";
import { debugNode, stringifyNode } from "stringifyNode";

type OptimizerStorage = {
  possibleVarTypes?: Record<string, Array<UnitType>>;
};

type OptimizerFunction = (node: Node, storage?: OptimizerStorage) => Node;

/** Applies each stage of optimizations until they dont mutate the ast */
export const optimizeAst = (
  ast: Node,
  stages: Array<Array<OptimizerFunction>>,
  storage: OptimizerStorage = {}
): Node => {
  if (stages.length === 0) {
    return ast;
  }
  const [currentStage, ...nextStages] = stages;

  const previousString = JSON.stringify(ast);
  const optimizedAst = processStage(ast, currentStage, storage);
  const optimizedString = JSON.stringify(optimizedAst);
  // debugNode(optimizedAst);

  return optimizeAst(
    optimizedAst,
    previousString === optimizedString ? nextStages : stages,
    storage
  );
};

/** Apply a stage */
const processStage = (
  ast: Node,
  stages: Array<OptimizerFunction>,
  storage: OptimizerStorage
) => {
  return stages.reduce((ast, stage) => stage(ast, storage), ast);
};
