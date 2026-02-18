import { NextRequest, NextResponse } from 'next/server';
import { type Message, LangChainAdapter } from 'ai';
import { BaseMessageChunk } from '@langchain/core/messages';
import { convertVercelMessageToLangChainMessage } from '@/utils/message-converters';
import { getMultiAgentGraph } from '@/agents/multi-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /**
     * We represent intermediate steps as system messages for display purposes,
     * but don't want them in the chat history.
     */
    const messages = (body.messages ?? [])
      .filter((message: Message) => message.role === 'user' || message.role === 'assistant')
      .map(convertVercelMessageToLangChainMessage);

    const graph = getMultiAgentGraph();

    const stream = await graph.stream(
      { messages },
      { streamMode: 'messages' }
    );

    return LangChainAdapter.toDataStreamResponse(
      (async function* () {
        for await (const chunk of stream) {
          const [message, metadata] = chunk as [
            BaseMessageChunk,
            Record<string, unknown>,
          ];
          // Only stream the synthesizer's output tokens, skip all intermediate nodes
          if (message.content && metadata.langgraph_node === 'synthesizer') {
            yield message;
          }
        }
      })()
    );
  } catch (e: unknown) {
    console.error(e);
    const error = e as { message?: string; status?: number };
    return NextResponse.json(
      { error: error.message ?? 'Internal server error' },
      { status: error.status ?? 500 }
    );
  }
}
