# Agent Architecture

## Overview

The multi-agent system uses [LangGraph](https://langchain-ai.github.io/langgraphjs/) to orchestrate a **decompose → parallel research → synthesize** pipeline. A user message is split into sub-questions, each sub-question is researched independently in parallel, and the results are merged into a single coherent response.

## Graph topology

```
START
  │
  ▼
decomposer ──(fan-out via Send)──► question_pipeline (×N, parallel)
                                        │
                                        ▼
                                   synthesizer
                                        │
                                        ▼
                                       END
```

Each `question_pipeline` is a compiled **subgraph** that runs:

```
rag_search → google_search → answer_generator
```

All N subgraphs run in parallel. Their results are merged back into shared state by a custom reducer before `synthesizer` runs.

## State

**File:** [src/agents/state.ts](../src/agents/state.ts)

```ts
interface SubQuestion {
  id: string;           // "q_0", "q_1", …
  question: string;
  needsGoogle: boolean;
  ragResults?: string;
  googleResults?: string;
  answer?: string;
}
```

`MultiAgentState` extends `MessagesAnnotation` (chat history) and adds a `subQuestions` array with a **merge reducer**: parallel pipeline writes update their own slot by `id` without overwriting each other.

## Nodes

### `decomposer`
**File:** [src/agents/decomposer.ts](../src/agents/decomposer.ts)

- Reads the last `HumanMessage` from state.
- Calls `gpt-4.1-mini` with structured output to split the user's query into one or more `SubQuestion` objects.
- Sets `needsGoogle: true` only for questions requiring real-time data (prices, trends, news).
- Returns the `subQuestions` array.

### `question_pipeline` (subgraph)
**File:** [src/agents/question-pipeline.ts](../src/agents/question-pipeline.ts)

A compiled subgraph invoked once per sub-question via the LangGraph `Send` API. Each instance receives a copy of state with `subQuestions` containing only its own single question.

#### `rag_search`
**File:** [src/agents/rag-search.ts](../src/agents/rag-search.ts)

- Reads `subQuestions[0]` (its own question).
- Queries a vector store for relevant knowledge-base snippets.
- Writes `ragResults` back onto the sub-question. If nothing is found, `ragResults` stays `undefined` and the answer generator falls back to general knowledge.
- **Currently:** stub implementation; replace with a real LangChain `VectorStoreRetriever` (Pinecone, pgvector, Chroma, etc.).

#### `google_search`
**File:** [src/agents/google-search.ts](../src/agents/google-search.ts)

- Skips entirely if `needsGoogle === false`.
- Otherwise queries a web search API for real-time results and writes `googleResults` onto the sub-question.
- **Currently:** stub implementation; replace with Serper, Tavily, or Google Custom Search.

#### `answer_generator`
**File:** [src/agents/answer-generator.ts](../src/agents/answer-generator.ts)

- Combines whatever context is available (`ragResults`, `googleResults`, or neither) into a prompt.
- Calls `gpt-4.1-mini` to produce a concise answer for the single sub-question.
- Writes the `answer` back onto the sub-question.
- On error, writes a graceful fallback message so other parallel pipelines are not blocked.

### `synthesizer`
**File:** [src/agents/synthesizer.ts](../src/agents/synthesizer.ts)

- Collects all completed sub-questions (those with an `answer`).
- Builds a Q&A context string and calls `gpt-4.1-mini` to compose one natural, flowing response.
- Respects the conversation language (e.g. responds in Russian if the user wrote in Russian).
- Appends the final `AIMessage` to state.

## Fan-out / fan-in mechanism

**File:** [src/agents/multi-agent.ts](../src/agents/multi-agent.ts)

```ts
function fanOutToSubQuestions(state): Send[] {
  return state.subQuestions.map(
    (q) => new Send("question_pipeline", { ...state, subQuestions: [q] })
  );
}
```

LangGraph's `Send` API dispatches one `question_pipeline` invocation per sub-question. Because each pipeline sees only its own question in `subQuestions[0]`, pipelines are fully isolated. The `mergeSubQuestions` reducer on shared state handles fan-in: each pipeline's result is merged by `id` before `synthesizer` runs.

## Key files

| File | Role |
|------|------|
| [src/agents/state.ts](../src/agents/state.ts) | Shared state schema and merge reducer |
| [src/agents/multi-agent.ts](../src/agents/multi-agent.ts) | Top-level graph, fan-out logic, singleton |
| [src/agents/question-pipeline.ts](../src/agents/question-pipeline.ts) | Per-question subgraph |
| [src/agents/decomposer.ts](../src/agents/decomposer.ts) | Query decomposition node |
| [src/agents/rag-search.ts](../src/agents/rag-search.ts) | Vector store retrieval node |
| [src/agents/google-search.ts](../src/agents/google-search.ts) | Web search node |
| [src/agents/answer-generator.ts](../src/agents/answer-generator.ts) | Per-question answer node |
| [src/agents/synthesizer.ts](../src/agents/synthesizer.ts) | Final response composition node |

## Extending the graph

- **Add a real vector store:** replace the stub in `rag-search.ts` with a LangChain `VectorStoreRetriever`.
- **Add a real web search:** replace the stub in `google-search.ts` with a Serper/Tavily/Google Custom Search call.
- **Add more pipeline steps:** insert additional nodes in `question-pipeline.ts` between `rag_search` and `answer_generator`.
- **Add pre/post-processing:** add nodes to the top-level graph in `multi-agent.ts` before `decomposer` or after `synthesizer`.
