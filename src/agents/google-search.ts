import { MultiAgentStateType, SubQuestion } from "./state";

export async function googleSearchNode(
  state: MultiAgentStateType
): Promise<Partial<MultiAgentStateType>> {
  const question = state.subQuestions[0];

  if (!question.needsGoogle) {
    // Skip Google search — question doesn't require real-time data
    return {};
  }

  console.log(`[Google] Searching for: ${question.question}`);

  // TODO: replace with real Google Search API (e.g. Serper, Tavily, or Google Custom Search)
  // Example with Serper:
  //   const response = await fetch("https://google.serper.dev/search", {
  //     method: "POST",
  //     headers: { "X-API-KEY": process.env.SERPER_API_KEY!, "Content-Type": "application/json" },
  //     body: JSON.stringify({ q: question.question, num: 5 }),
  //   });
  //   const data = await response.json();
  //   const googleResults = data.organic.map((r: { snippet: string }) => r.snippet).join("\n\n");

  const googleResults = `[Google STUB] Trending results for: ${question.question} — (stub data, replace with real API)`;

  const updatedQuestion: SubQuestion = {
    ...question,
    googleResults,
  };

  return { subQuestions: [updatedQuestion] };
}
