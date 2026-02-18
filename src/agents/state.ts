import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export interface SubQuestion {
  id: string;
  question: string;
  needsGoogle: boolean;
  ragResults?: string;
  googleResults?: string;
  answer?: string;
}

/**
 * Merge reducer for subQuestions: updates existing entries by id,
 * appends new ones. This ensures parallel pipeline writes don't
 * overwrite each other — each pipeline updates its own slot.
 */
function mergeSubQuestions(
  existing: SubQuestion[],
  incoming: SubQuestion[]
): SubQuestion[] {
  const map = new Map<string, SubQuestion>(existing.map((q) => [q.id, q]));
  for (const q of incoming) {
    map.set(q.id, { ...map.get(q.id), ...q });
  }
  return Array.from(map.values());
}

export const MultiAgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
  subQuestions: Annotation<SubQuestion[]>({
    reducer: mergeSubQuestions,
    default: () => [],
  }),
});

export type MultiAgentStateType = typeof MultiAgentState.State;
