import React from 'react';

interface MarqueeProps {
  items: string[];
  renderItem?: (item: string, index: number) => React.ReactNode;
  duration?: number;
  direction?: 'left' | 'right';
  separator?: React.ReactNode;
  className?: string;
  itemClassName?: string;
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
  if (!items?.length) return null;
  const doubled = [...items, ...items];
  const animationStyle: React.CSSProperties = {
    display: 'flex', width: 'max-content', animation: `marquee-scroll ${duration}s linear infinite`,
    animationDirection: direction === 'right' ? 'reverse' : 'normal',
  };
  return (
    <div className={`overflow-hidden ${className}`} style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
      <style>{`@keyframes marquee-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.marquee-track:hover{animation-play-state:${pauseOnHover ? 'paused' : 'running'}}`}</style>
      <div className="marquee-track" style={animationStyle}>{doubled.map((item, i) => <span key={`${item}-${i}`} className={`inline-flex items-center whitespace-nowrap ${itemClassName}`}>{renderItem ? renderItem(item, i % items.length) : item}{separator}</span>)}</div>
    </div>
  );
};

export const AnnouncementMarquee: React.FC = () => (
  <div className="bg-pm-wine py-2 text-[8px] font-bold uppercase tracking-[0.32em] text-pm-ivory">
    <Marquee items={[
      'Perfect Models Management • Libreville, Gabon',
      'Casting & développement de talents',
      'Perfect Fashion Day • Mode, création, rencontres',
      'Management • Production • Direction artistique',
    ]} duration={40} separator={<span className="mx-8 opacity-40">◆</span>} pauseOnHover={false} />
  </div>
);

export default AnnouncementMarquee;
