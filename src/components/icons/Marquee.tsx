import React from 'react';
import { useData } from '../../contexts/DataContext';

interface MarqueeProps {
  /** Items to display. Each item is rendered by the renderItem prop or as plain text. */
  items: string[];
  /** Optional custom renderer for each item */
  renderItem?: (item: string, index: number) => React.ReactNode;
  /** Speed in seconds for one full loop. Default: 30 */
  duration?: number;
  /** Direction. Default: left */
  direction?: 'left' | 'right';
  /** Separator between items. Default: diamond bullet */
  separator?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  /** Pause on hover. Default: true */
  pauseOnHover?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({
  items,
  renderItem,
  duration = 30,
  direction = 'left',
  separator = <span className="mx-6 text-pm-gold/40 select-none">◆</span>,
  className = '',
  itemClassName = '',
  pauseOnHover = true,
}) => {
  if (!items || items.length === 0) return null;

  // Duplicate items to create seamless loop
  const doubled = [...items, ...items];

  const animationStyle: React.CSSProperties = {
    display: 'flex',
    width: 'max-content',
    animation: `marquee-scroll ${duration}s linear infinite`,
    animationDirection: direction === 'right' ? 'reverse' : 'normal',
  };

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
    >
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track:hover { animation-play-state: ${pauseOnHover ? 'paused' : 'running'}; }
      `}</style>
      <div className="marquee-track" style={animationStyle}>
        {doubled.map((item, i) => (
          <span key={i} className={`inline-flex items-center whitespace-nowrap ${itemClassName}`}>
            {renderItem ? renderItem(item, i % items.length) : item}
            {separator}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Top-bar announcement marquee (used in Layout) ───────────────────────────
export const AnnouncementMarquee: React.FC = () => {
  const { data } = useData();
  const partners = data?.agencyPartners || [];

  const items = partners.length > 0
    ? partners.map(p => p.name)
    : [
        'Perfect Models Management • Libreville, Gabon',
        'Casting & développement de talents',
        'Perfect Fashion Day • Mode, création, rencontres',
        'Management • Production • Direction artistique',
      ];

  return (
    <div className="bg-pm-wine py-2 text-[8px] font-bold uppercase tracking-[0.32em] text-pm-ivory">
      <Marquee
        items={items}
        duration={40}
        separator={<span className="mx-8 opacity-40">◆</span>}
        pauseOnHover={false}
      />
    </div>
  );
};

export default AnnouncementMarquee;
