'use client';

import { useState } from 'react';

interface Props {
  tasks: {
    title: string;
    estimatedDuration: number | null;
    completed: boolean;
  }[];
  todayStr: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const remainderMins = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${Math.round(seconds / 60)}m`;
  if (remainderMins === 0) return `${hours}h`;
  return `${hours}h ${remainderMins}m`;
}

export function CopyTasksButton({ tasks, todayStr }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const [, mm, dd] = todayStr.split('-');
    const dateFormatted = `${dd}.${mm}`;
    const lines: string[] = [`📅 ${dateFormatted}`, ''];
    for (const t of tasks) {
      const estimatePart = t.estimatedDuration
        ? ` | ⏳ --:-- (est: ${formatDuration(t.estimatedDuration)})`
        : '';
      lines.push(`• ${t.title}${estimatePart}`);
    }
    const text = lines.join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (tasks.length === 0) return null;

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
