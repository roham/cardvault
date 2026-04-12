import Link from 'next/link';
import type { SportsCard } from '@/data/sports-cards';

const sportColors: Record<SportsCard['sport'], string> = {
  baseball: 'from-red-900 to-red-800',
  basketball: 'from-orange-900 to-orange-800',
  football: 'from-blue-900 to-blue-800',
  hockey: 'from-cyan-900 to-cyan-800',
};

const sportIcons: Record<SportsCard['sport'], string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

interface SportsCardTileProps {
  card: SportsCard;
}

export default function SportsCardTile({ card }: SportsCardTileProps) {
  return (
    <Link href={`/sports/${card.slug}`} className="group block">
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-0.5">
        {/* Card image placeholder */}
        <div className={`relative aspect-[2.5/3.5] bg-gradient-to-br ${sportColors[card.sport]} flex flex-col items-center justify-center p-4`}>
          <div className="text-4xl mb-2">{sportIcons[card.sport]}</div>
          <div className="text-center">
            <p className="text-white font-bold text-sm leading-tight">{card.player}</p>
            <p className="text-gray-300 text-xs mt-1">{card.year}</p>
          </div>
          {card.rookie && (
            <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              RC
            </span>
          )}
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <p className="text-gray-400 text-xs truncate">{card.set}</p>
          </div>
        </div>

        {/* Card info */}
        <div className="p-3">
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
