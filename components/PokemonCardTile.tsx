import Link from 'next/link';
import Image from 'next/image';

interface PokemonCardData {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  images?: {
    small?: string;
    large?: string;
  };
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number };
      normal?: { market?: number };
      reverseHolofoil?: { market?: number };
    };
  };
  set?: {
    id: string;
    name: string;
  };
}

interface PokemonCardTileProps {
  card: PokemonCardData;
}

function getPrice(card: PokemonCardData): string {
  const prices = card.tcgplayer?.prices;
  if (!prices) return 'Price N/A';
  const p = prices.holofoil?.market ?? prices.normal?.market ?? prices.reverseHolofoil?.market;
  if (!p) return 'Price N/A';
  return `$${p.toFixed(2)}`;
}

const rarityColor: Record<string, string> = {
  'Common': 'text-gray-400',
  'Uncommon': 'text-green-400',
  'Rare': 'text-blue-400',
  'Rare Holo': 'text-purple-400',
  'Rare Ultra': 'text-yellow-400',
  'Rare Secret': 'text-pink-400',
  'Rare Rainbow': 'text-pink-300',
  'Amazing Rare': 'text-emerald-400',
};

export default function PokemonCardTile({ card }: PokemonCardTileProps) {
  const price = getPrice(card);
  const rarityClass = card.rarity ? (rarityColor[card.rarity] ?? 'text-gray-400') : 'text-gray-400';

  return (
    <Link href={`/pokemon/cards/${card.id}`} className="group block">
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-0.5">
        {/* Card image */}
        <div className="relative aspect-[2.5/3.5] bg-gray-800 flex items-center justify-center overflow-hidden">
          {card.images?.small ? (
            <Image
              src={card.images.small}
              alt={card.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-600 p-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              <span className="text-xs">{card.name}</span>
            </div>
          )}
        </div>

        {/* Card info */}
        <div className="p-3">
          <h3 className="text-white text-xs font-semibold leading-tight truncate group-hover:text-emerald-400 transition-colors">
            {card.name}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-gray-500 text-xs">#{card.number}</span>
            {card.rarity && (
              <span className={`text-xs ${rarityClass} truncate max-w-[100px]`}>{card.rarity}</span>
            )}
          </div>
          <p className="text-emerald-400 text-xs font-medium mt-1.5">{price}</p>
        </div>
      </div>
    </Link>
  );
}
