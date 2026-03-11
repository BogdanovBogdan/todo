'use client';

import { useState } from 'react';

interface Props {
  tasks: { title: string; estimatedDuration: number | null }[];
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
    const [y, m, d] = todayStr.split('-').map(Number);
    const dateLabel = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(y, m - 1, d, 12));
    const text = [
      `📅 ${dateLabel}`,
      '',
      ...tasks.map((t) =>
        t.estimatedDuration
          ? `• ${t.title} [${formatDuration(t.estimatedDuration)}]`
          : `• ${t.title}`
      ),
    ].join('\n');
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
