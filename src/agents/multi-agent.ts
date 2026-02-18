import { StateGraph, START, END, Send } from "@langchain/langgraph";
import { MultiAgentState, MultiAgentStateType } from "./state";
import { decomposerNode } from "./decomposer";
import { synthesizerNode } from "./synthesizer";
import { createQuestionPipeline } from "./question-pipeline";

/**
 * Fan-out: each sub-question gets its own isolated pipeline invocation via Send.
 * Each pipeline sees only its own question in subQuestions[0].
 * The merge reducer on subQuestions handles the fan-in automatically.
 */
function fanOutToSubQuestions(state: MultiAgentStateType): Send[] {
  return state.subQuestions.map(
    (q) =>
      new Send("question_pipeline", {
        ...state,
        subQuestions: [q],
      })
  );
}

function buildGraph() {
  const questionPipeline = createQuestionPipeline();

  return new StateGraph(MultiAgentState)
    .addNode("decomposer", decomposerNode)
    .addNode("question_pipeline", questionPipeline)
    .addNode("synthesizer", synthesizerNode)
    .addEdge(START, "decomposer")
    .addConditionalEdges("decomposer", fanOutToSubQuestions)
    .addEdge("question_pipeline", "synthesizer")
    .addEdge("synthesizer", END)
    .compile();
}

// Singleton: compile once and reuse across requests
let _graph: ReturnType<typeof buildGraph> | null = null;

export function getMultiAgentGraph(): ReturnType<typeof buildGraph> {
  if (!_graph) {
    _graph = buildGraph();
  }
  return _graph;
}
