'use client';

import { useState } from 'react';
import { ArrowUpOnSquareIcon, CheckIcon } from '@heroicons/react/24/outline';

type Props = {
  title: string;
  text?: string;
  url?: string;
  label?: string;
  className?: string;
};

export default function ShareButton({ title, text, url, label = 'Partager', className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const target = url || (typeof window !== 'undefined' ? window.location.href : '');
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: target });
        return;
      }
      await navigator.clipboard.writeText(target);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(target);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          // Sharing is an enhancement; never interrupt the page if the platform blocks it.
        }
      }
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={`${label} — ${title}`}
      title={copied ? 'Lien copié' : label}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/45 backdrop-blur transition hover:border-pm-gold/35 hover:bg-pm-gold/[0.07] hover:text-pm-gold ${className}`}
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <ArrowUpOnSquareIcon className="h-3.5 w-3.5" />}
      <span>{copied ? 'Copié' : label}</span>
    </button>
  );
}
