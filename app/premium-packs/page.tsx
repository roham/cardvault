import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PremiumPacksClient from './PremiumPacksClient';

export const metadata: Metadata = {
  title: 'Premium Digital Packs — Themed Card Collections',
  description: 'Open themed digital card packs. Baseball Legends, Basketball GOAT, Football Elite, Hockey Classics, Pre-War Treasures, and more. Collect rare cards for your digital binder.',
  openGraph: {
    title: 'Premium Digital Packs — CardVault',
    description: 'Themed digital card packs with different collections. Collect rare cards for your binder.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Premium Digital Packs — CardVault',
    description: 'Themed card packs: Baseball Legends, Basketball GOAT, Football Elite, and more.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Premium Packs' },
];

export default function PremiumPacksPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Premium Digital Packs',
        url: 'https://cardvault-two.vercel.app/premium-packs',
        description: 'Themed digital card packs — collect rare cards for your binder.',
        applicationCategory: 'CollectingApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <Breadcrumb items={breadcrumbs} />
      <PremiumPacksClient />
    </>
  );
}
