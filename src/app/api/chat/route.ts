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

    // LangChainAdapter.toDataStreamResponse calls .pipeThrough() internally,
    // so we must wrap filtering logic in a ReadableStream (not an AsyncGenerator).
    const filteredStream = new ReadableStream<BaseMessageChunk>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const [message, metadata] = chunk as [
              BaseMessageChunk,
              Record<string, unknown>,
            ];
            // Only stream the synthesizer's output tokens, skip all intermediate nodes
            if (message.content && metadata.langgraph_node === 'synthesizer') {
              controller.enqueue(message);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return LangChainAdapter.toDataStreamResponse(filteredStream as any);
  } catch (e: unknown) {
    console.error(e);
    const error = e as { message?: string; status?: number };
    return NextResponse.json(
      { error: error.message ?? 'Internal server error' },
      { status: error.status ?? 500 }
    );
  }
}
