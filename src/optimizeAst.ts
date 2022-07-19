import { UnitType } from "cssUnitFunctions";
import { Node } from "parseCalc";
import { debugNode, stringifyNode } from "stringifyNode";

export type OptimizerStorage = {
  possibleVarTypes?: Record<string, Array<UnitType>>;
  knownCalcPrefixes?: Array<string>;
};

export type OptimizerFunction = (node: Node, storage: OptimizerStorage) => Node;

export type OptimizerStage = Array<OptimizerStage> | OptimizerFunction;

/** Applies each stage of optimizations until they dont mutate the ast */
export const optimizeAst = (
  ast: Node,
  stages: OptimizerStage,
  storage: OptimizerStorage = {}
): Node => {
  if (stages.length === 0) {
    return ast;
  }
  // const [currentStage, ...nextStages] = stages;

  // const previousString = JSON.stringify(ast);
  // const optimizedAst =
  // const optimizedString = JSON.stringify(optimizedAst);
  // debugNode(optimizedAst);

  return processStage(ast, stages, storage);
};

/** Apply a stage */
const processStage = (
  ast: Node,
  stage: OptimizerStage,
  storage: OptimizerStorage
): Node => {
  if (Array.isArray(stage)) {
    const [currentStage, ...nextStages] = stage;
    const previousString = JSON.stringify(ast);
    const optimizedAst = stage.reduce(
      (ast, stage) => processStage(ast, stage, storage),
      ast
    );
    const optimizedString = JSON.stringify(optimizedAst);

    return previousString === optimizedString
      ? optimizedAst
      : processStage(optimizedAst, stage, storage);
  } else {
    return stage(ast, storage);
  }
};
