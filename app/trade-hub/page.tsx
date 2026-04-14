import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradeHubClient from './TradeHubClient';

export const metadata: Metadata = {
  title: 'Trade Hub — Propose & Accept Card Trades',
  description: 'Create card trade proposals, evaluate trade fairness, and share with other collectors. Build offers from your digital binder, compare values, and execute trades. Zero-backend peer-to-peer trading.',
  openGraph: {
    title: 'Trade Hub — CardVault',
    description: 'Propose and accept card trades. Compare values, share proposals, and build your collection through trading.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Trade Hub — CardVault',
    description: 'Propose, evaluate, and share card trades with other collectors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Trade Hub' },
];

export default function TradeHubPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Trade Hub',
        url: 'https://cardvault-two.vercel.app/trade-hub',
        description: 'Propose, evaluate, and share card trades with other collectors.',
        applicationCategory: 'CollectingApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <Breadcrumb items={breadcrumbs} />
      <TradeHubClient />
    </>
  );
}
