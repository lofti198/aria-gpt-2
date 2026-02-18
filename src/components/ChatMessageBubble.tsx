'use client';

import { useState } from 'react';
import type { Message } from 'ai/react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/utils/cn';

interface StepAnnotation {
  type: 'step';
  node: string;
  label: string;
}

function StepPane({ steps }: { steps: StepAnnotation[] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-3 text-xs text-muted-foreground/80">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 hover:text-muted-foreground transition-colors select-none"
      >
        <ChevronRight
          className={cn(
            'w-3 h-3 transition-transform duration-150',
            open && 'rotate-90'
          )}
        />
        <span>
          {steps.length} step{steps.length !== 1 ? 's' : ''}
        </span>
      </button>

      {open && (
        <div className="mt-1.5 ml-4 border-l border-border/40 pl-3 flex flex-col gap-1">
          {steps.map((step) => (
            <div key={step.node} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              {step.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources: unknown[];
}) {
  const steps = (
    props.message.role === 'assistant'
      ? (props.message.annotations ?? []).filter(
          (a) =>
            typeof a === 'object' &&
            a !== null &&
            !Array.isArray(a) &&
            (a as Record<string, unknown>).type === 'step'
        )
      : []
  ) as unknown as StepAnnotation[];

  return (
    <div
      className={cn(
        `rounded-[24px] max-w-[80%] mb-8 flex`,
        props.message.role === 'user'
          ? 'bg-secondary text-secondary-foreground px-4 py-2'
          : null,
        props.message.role === 'user' ? 'ml-auto' : 'mr-auto',
      )}
    >
      {props.message.role !== 'user' && (
        <div className="mr-4 border bg-secondary -mt-2 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
          {props.aiEmoji}
        </div>
      )}

      <div className="whitespace-pre-wrap flex flex-col">
        {steps.length > 0 && <StepPane steps={steps} />}

        <span>{props.message.content}</span>

        {props.sources && (props.sources as { pageContent?: unknown }[]).length ? (
          <>
            <code className="mt-4 mr-auto bg-primary px-2 py-1 rounded">
              <h2>🔍 Sources:</h2>
            </code>
            <code className="mt-1 mr-2 bg-primary px-2 py-1 rounded text-xs">
              {(props.sources as { pageContent?: string; metadata?: { loc?: { lines?: { from?: number; to?: number } } } }[]).map(
                (source, i) => (
                  <div className="mt-2" key={'source:' + i}>
                    {i + 1}. &quot;{source.pageContent}&quot;
                    {source.metadata?.loc?.lines !== undefined ? (
                      <div>
                        <br />
                        Lines {source.metadata?.loc?.lines?.from} to{' '}
                        {source.metadata?.loc?.lines?.to}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                )
              )}
            </code>
          </>
        ) : null}
      </div>
    </div>
  );
}
