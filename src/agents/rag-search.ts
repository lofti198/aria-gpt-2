import { MultiAgentStateType, SubQuestion } from "./state";

export async function ragSearchNode(
  state: MultiAgentStateType
): Promise<Partial<MultiAgentStateType>> {
  const question = state.subQuestions[0];

  console.log(`[RAG] Searching for: ${question.question}`);

  // TODO: replace with real vector store retriever
  // e.g. Pinecone, Weaviate, pgvector, or Chroma via LangChain VectorStoreRetriever:
  //   const retriever = vectorStore.asRetriever({ k: 4 });
  //   const docs = await retriever.invoke(question.question);
  //   const ragResults = docs.map(d => d.pageContent).join("\n\n");

  let ragResults: string | undefined = undefined;

  // For testing: return a stub KB snippet when the question mentions lashes/eyelash extension
  if (
    question.question.toLowerCase().includes("lashes") ||
    question.question.includes("ресниц")
  ) {
    ragResults =
      "[RAG STUB] Knowledge base snippet: " +
      "Наращивание ресниц — это косметическая процедура, при которой искусственные ресницы " +
      "приклеиваются к натуральным с помощью специального клея на основе цианоакрилата. " +
      "Процедура занимает 1.5–3 часа. Основные техники: классика (1:1), 2D, 3D, объём, " +
      "мегаобъём. Материалы: норка, шёлк, синтетика. Коррекция требуется каждые 2–3 недели.";
  }

  // If no results found (ragResults stays undefined), the answer-generator
  // will fall back to general knowledge — this is intentional.

  const updatedQuestion: SubQuestion = {
    ...question,
    ragResults,
  };

  return { subQuestions: [updatedQuestion] };
}
