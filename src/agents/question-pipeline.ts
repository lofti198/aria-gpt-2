import { StateGraph, START, END } from "@langchain/langgraph";
import { MultiAgentState } from "./state";
import { ragSearchNode } from "./rag-search";
import { googleSearchNode } from "./google-search";
import { answerGeneratorNode } from "./answer-generator";

/**
 * Composes RAG search → Google search → Answer generation into a compiled
 * subgraph. Each parallel sub-question gets its own instance via Send API.
 */
export function createQuestionPipeline() {
  return new StateGraph(MultiAgentState)
    .addNode("rag_search", ragSearchNode)
    .addNode("google_search", googleSearchNode)
    .addNode("answer_generator", answerGeneratorNode)
    .addEdge(START, "rag_search")
    .addEdge("rag_search", "google_search")
    .addEdge("google_search", "answer_generator")
    .addEdge("answer_generator", END)
    .compile();
}
