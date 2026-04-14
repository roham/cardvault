import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShowcaseClient from './ShowcaseClient';

export const metadata: Metadata = {
  title: 'Trophy Case — Build & Share Your Card Collection Showcase',
  description: 'Curate your top 9 sports cards into a beautiful trophy case. Share your showcase with friends and see other collectors\' prized possessions. Free, no account needed.',
  openGraph: {
    title: 'Trophy Case — CardVault',
    description: 'Build a shareable trophy case of your favorite sports cards. Pick your top 9 cards and share your collection.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Trophy Case — CardVault',
    description: 'Curate and share your sports card trophy case. Pick your top 9 cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Trophy Case' },
];

export default function ShowcasePage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Trophy Case',
        url: 'https://cardvault-two.vercel.app/showcase',
        description: 'Build and share a showcase of your top sports cards.',
        applicationCategory: 'CollectingApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <Breadcrumb items={breadcrumbs} />
      <ShowcaseClient />
    </>
  );
}
