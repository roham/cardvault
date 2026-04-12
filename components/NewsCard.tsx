import type { NewsItem } from '@/data/news';

const categoryLabel: Record<NewsItem['category'], string> = {
  sports: 'Sports Cards',
  pokemon: 'Pokémon TCG',
  market: 'Market',
};

const categoryColor: Record<NewsItem['category'], string> = {
  sports: 'bg-blue-900/60 text-blue-300',
  pokemon: 'bg-yellow-900/60 text-yellow-300',
  market: 'bg-emerald-900/60 text-emerald-300',
};

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  const date = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
      {/* Color bar */}
      <div className={`h-1.5 bg-gradient-to-r ${item.imageColor}`} />

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${categoryColor[item.category]}`}>
            {categoryLabel[item.category]}
          </span>
          <span className="text-gray-500 text-xs">{date}</span>
        </div>

        <h3 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2">
          {item.title}
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
          {item.summary}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">{item.source}</span>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors font-medium"
          >
            Read more →
          </a>
        </div>
      </div>
    </article>
  );
}
