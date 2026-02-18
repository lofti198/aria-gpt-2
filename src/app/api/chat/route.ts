import { NextRequest, NextResponse } from 'next/server';
import { type Message } from 'ai';
import { BaseMessageChunk } from '@langchain/core/messages';
import { convertVercelMessageToLangChainMessage } from '@/utils/message-converters';
import { getMultiAgentGraph } from '@/agents/multi-agent';

// Human-readable labels for each graph node shown in the UI step pane
const STEP_LABELS: Record<string, string> = {
  decomposer: 'Analysing your question',
  question_pipeline: 'Researching',
  rag_search: 'Checking knowledge base',
  google_search: 'Searching the web',
  answer_generator: 'Generating answers',
  synthesizer: 'Composing response',
};

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
    const encoder = new TextEncoder();

    /**
     * Stream the graph using the Vercel AI SDK data-stream protocol directly:
     *   0:"<text>"\n        → text delta (appended to message content)
     *   8:[{...}]\n         → message annotation (appears in message.annotations[])
     *   d:{...}\n           → finish message
     *
     * This lets us emit step annotations for every new graph node
     * AND stream synthesizer tokens in the same pass over the stream.
     */
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          // Use both modes simultaneously:
          //   'updates' fires for EVERY node that changes state (including
          //             rag_search / google_search which emit no LLM tokens)
          //   'messages' fires per LLM token so we can stream the final text
          const stream = await graph.stream(
            { messages },
            { streamMode: ['updates', 'messages'] }
          );

          const seenNodes = new Set<string>();

          const emitStep = (node: string) => {
            if (seenNodes.has(node) || node.startsWith('__')) return;
            seenNodes.add(node);
            const label = STEP_LABELS[node] ?? node;
            controller.enqueue(
              encoder.encode(`8:${JSON.stringify([{ type: 'step', node, label }])}\n`)
            );
          };

          for await (const chunk of stream) {
            const [mode, value] = chunk as [string, unknown];

            if (mode === 'updates') {
              // value is { nodeName: stateUpdate } — one entry per completed node
              for (const node of Object.keys(value as Record<string, unknown>)) {
                emitStep(node);
              }
            } else if (mode === 'messages') {
              const [message, metadata] = value as [
                BaseMessageChunk,
                Record<string, unknown>,
              ];
              const node = metadata.langgraph_node as string;

              // Catch any LLM node not yet seen via updates
              emitStep(node);

              // Stream synthesizer tokens as visible message content
              if (node === 'synthesizer' && typeof message.content === 'string' && message.content) {
                controller.enqueue(encoder.encode(`0:${JSON.stringify(message.content)}\n`));
              }
            }
          }

          // Signal end of message to the AI SDK
          controller.enqueue(
            encoder.encode(
              `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          controller.enqueue(encoder.encode(`3:${JSON.stringify(msg)}\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1',
      },
    });
  } catch (e: unknown) {
    console.error(e);
    const error = e as { message?: string; status?: number };
    return NextResponse.json(
      { error: error.message ?? 'Internal server error' },
      { status: error.status ?? 500 }
    );
  }
}
