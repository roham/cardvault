import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import CardOfTheDayClient from './CardOfTheDayClient';

export const metadata: Metadata = {
  title: 'Card of the Day — Daily Featured Card with Trivia',
  description: 'A new featured card every day with trivia, market insights, and fun facts. Come back daily to discover a different iconic sports or Pokémon card.',
  alternates: { canonical: './' },
};

export default function CardOfTheDayPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app' },
      { '@type': 'ListItem', position: 2, name: 'Card of the Day' },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={breadcrumbLd} />
      <CardOfTheDayClient />
    </div>
  );
}
