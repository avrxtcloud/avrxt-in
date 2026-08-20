'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import LinkPreviewCard from '@/components/LinkPreviewCard';
import { cn } from '@/lib/utils';

function isProbablyUrl(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('www.');
}

export default function GlobalLinkPreview() {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const hideTimer = useRef<number | null>(null);

  const visible = Boolean(activeUrl && pos);
  const style = useMemo(() => {
    if (!pos) return undefined;
    return {
      left: Math.max(12, Math.min(window.innerWidth - 360, pos.x + 12)),
      top: Math.max(12, Math.min(window.innerHeight - 260, pos.y + 12)),
    } as React.CSSProperties;
  }, [pos]);

  useEffect(() => {
    const clearHide = () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    };

    const scheduleHide = () => {
      clearHide();
      hideTimer.current = window.setTimeout(() => {
        setActiveUrl(null);
        setPos(null);
      }, 250);
    };

    const onOver = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a') as HTMLAnchorElement | null;
      const href = a?.getAttribute('href') || '';
      if (!a || !href || !isProbablyUrl(href)) return;

      clearHide();
      setActiveUrl(href.startsWith('www.') ? `https://${href}` : href);
      const rect = a.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height });
    };

    const onOut = () => scheduleHide();

    const onMove = (e: MouseEvent) => {
      if (!activeUrl) return;
      setPos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mouseover', onOver);
    document.addEventListener('focusin', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('focusout', onOut);
    document.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      clearHide();
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('focusin', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('focusout', onOut);
      document.removeEventListener('mousemove', onMove);
    };
  }, [activeUrl]);

  if (!visible || !activeUrl) return null;

  return (
    <div
      className={cn(
        'fixed z-[9999] hidden lg:block',
        'w-[340px]'
      )}
      style={style}
      onMouseEnter={() => {
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }}
      onMouseLeave={() => {
        setActiveUrl(null);
        setPos(null);
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 blur-2xl opacity-30 bg-emerald-500/20 rounded-2xl" />
      <div className="pointer-events-auto">
        <LinkPreviewCard url={activeUrl} mode="compact" />
      </div>
    </div>
  );
}

