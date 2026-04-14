import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DigitalPackClient from './DigitalPackClient';

export const metadata: Metadata = {
  title: 'Daily Digital Pack — Free Cards Every Day for Your Binder',
  description: 'Open a free digital pack every day! Get 5 random sports cards added to your digital binder. Build your collection one pack at a time. Track your streak, share rare pulls.',
  openGraph: {
    title: 'Daily Digital Pack — CardVault',
    description: 'Free digital pack every day — 5 random cards for your binder. Build your collection. Track your streak.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Daily Digital Pack — CardVault',
    description: '5 free digital cards every day for your binder. Build your collection!',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Digital Pack' },
];

export default function DigitalPackPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Daily Digital Pack',
        url: 'https://cardvault-two.vercel.app/digital-pack',
        description: 'Free daily digital card pack — 5 random sports cards for your binder every day.',
        applicationCategory: 'CollectingApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <Breadcrumb items={breadcrumbs} />
      <DigitalPackClient />
    </>
  );
}
