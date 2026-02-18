import { ChatOpenAI } from "@langchain/openai";
import { MultiAgentStateType, SubQuestion } from "./state";

const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0.3 });

export async function answerGeneratorNode(
  state: MultiAgentStateType
): Promise<Partial<MultiAgentStateType>> {
  const question = state.subQuestions[0];

  // Build context string from whatever sources are available
  const contextParts: string[] = [];

  if (question.ragResults) {
    contextParts.push(`Knowledge base context:\n${question.ragResults}`);
  }
  if (question.googleResults) {
    contextParts.push(`Web search results:\n${question.googleResults}`);
  }

  const contextString = contextParts.join("\n\n");

  const contextSource =
    question.ragResults && question.googleResults
      ? "rag + google context"
      : question.ragResults
        ? "rag context"
        : question.googleResults
          ? "google context"
          : "general knowledge";

  console.log(`[AnswerGenerator] Answering ${question.id} with: ${contextSource}`);

  try {
    const userContent = contextString
      ? `Context:\n${contextString}\n\nQuestion: ${question.question}`
      : question.question;

    const response = await model.invoke([
      {
        role: "system",
        content: contextString
          ? "You are a helpful assistant. Answer the specific question concisely and directly using the provided context. If the context is a stub/placeholder, still give a useful answer from your general knowledge."
          : "You are a helpful assistant. Answer the specific question concisely and directly from your general knowledge.",
      },
      {
        role: "user",
        content: userContent,
      },
    ]);

    const updatedQuestion: SubQuestion = {
      ...question,
      answer: response.content as string,
    };

    return { subQuestions: [updatedQuestion] };
  } catch (error) {
    // On error, set a fallback answer so other parallel pipelines aren't blocked
    console.error(`[AnswerGenerator] Error for ${question.id}:`, error);

    const updatedQuestion: SubQuestion = {
      ...question,
      answer: `Unable to generate an answer for: "${question.question}". Please try again.`,
    };

    return { subQuestions: [updatedQuestion] };
  }
}
