import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { MultiAgentStateType, SubQuestion } from "./state";

const model = new ChatOpenAI({ model: "gpt-4.1-mini", temperature: 0 });

const subQuestionSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("A clear, self-contained sub-question"),
      needsGoogle: z
        .boolean()
        .describe(
          "True only when the question clearly requires current/real-time info: trends, prices, news, recent events, dates"
        ),
    })
  ),
});

export async function decomposerNode(
  state: MultiAgentStateType
): Promise<Partial<MultiAgentStateType>> {
  const lastHumanMessage = [...state.messages]
    .reverse()
    .find((m) => m instanceof HumanMessage);

  const userInput =
    typeof lastHumanMessage?.content === "string"
      ? lastHumanMessage.content
      : "";

  console.log(`[Decomposer] Processing: "${userInput.slice(0, 120)}"`);

  const structured = model.withStructuredOutput(subQuestionSchema);

  const result = await structured.invoke([
    {
      role: "system",
      content: `You are a query decomposer. Split the user's message into clear, individual sub-questions that can be answered independently.

Rules:
- Be conservative — prefer fewer, well-scoped questions over over-splitting.
- If the user message is already a single simple question, return an array with one item.
- Set needsGoogle=true ONLY when the question clearly requires current/real-time information: trends, prices, news, recent events, live data.
- Set needsGoogle=false for general knowledge, how-to questions, and factual questions that don't change over time.`,
    },
    {
      role: "user",
      content: userInput,
    },
  ]);

  const subQuestions: SubQuestion[] = result.questions.map((q, index) => ({
    id: `q_${index}`,
    question: q.question,
    needsGoogle: q.needsGoogle,
  }));

  console.log(`[Decomposer] Found ${subQuestions.length} sub-question(s)`);
  subQuestions.forEach((q) =>
    console.log(`  [${q.id}] "${q.question}" (needsGoogle=${q.needsGoogle})`)
  );

  return { subQuestions };
}
