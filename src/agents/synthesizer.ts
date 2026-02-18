import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { MultiAgentStateType } from "./state";

const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0.5 });

function getMessageContent(msg: BaseMessage): string {
  if (typeof msg.content === "string") return msg.content;
  // Handle complex content arrays (e.g. multimodal)
  return msg.content
    .map((part) =>
      typeof part === "string" ? part : (part as { text?: string }).text ?? ""
    )
    .join("");
}

export async function synthesizerNode(
  state: MultiAgentStateType
): Promise<Partial<MultiAgentStateType>> {
  const completedQuestions = state.subQuestions.filter((q) => q.answer);

  console.log(
    `[Synthesizer] Merging ${completedQuestions.length} answer(s) into final response`
  );

  // Conversation history excluding the last user message (already captured in subQuestions)
  const conversationHistory = state.messages.slice(0, -1);

  const qaContext = completedQuestions
    .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
    .join("\n\n");

  const historyMessages = conversationHistory.map((msg) => ({
    role: (msg instanceof HumanMessage ? "user" : "assistant") as
      | "user"
      | "assistant",
    content: getMessageContent(msg),
  }));

  const response = await model.invoke([
    {
      role: "system",
      content: `You are a helpful assistant. You have researched and answered several sub-questions. Now compose one natural, flowing response that covers all of them.

Rules:
- Do NOT mechanically number the answers or repeat the sub-questions verbatim.
- Write like a helpful assistant having a natural conversation.
- Match the language of the user (if they wrote in Russian, respond in Russian).
- Keep the response focused and coherent.`,
    },
    ...historyMessages,
    {
      role: "user",
      content: `Based on the following research, compose a unified response:\n\n${qaContext}`,
    },
  ]);

  const finalResponse = response.content as string;

  return { messages: [new AIMessage(finalResponse)] };
}
