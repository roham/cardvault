import Link from 'next/link';
import type { SportsCard } from '@/data/sports-cards';
import CardFrame from '@/components/CardFrame';

interface SportsCardTileProps {
  card: SportsCard;
}

export default function SportsCardTile({ card }: SportsCardTileProps) {
  return (
    <Link href={`/sports/${card.slug}`} className="group block">
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-0.5">
        {/* Stylized card frame */}
        <div className="p-1.5">
          <CardFrame card={card} size="small" />
        </div>

        {/* Card info */}
        <div className="p-3 pt-2">
          <h3 className="text-white text-xs font-semibold leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {card.name}
          </h3>
          <p className="text-emerald-400 text-xs font-medium mt-1.5">{card.estimatedValueRaw}</p>
          <p className="text-gray-500 text-xs capitalize mt-0.5">{card.sport}</p>
        </div>
      </div>
    </Link>
  );
}
