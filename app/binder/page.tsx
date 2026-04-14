import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BinderClient from './BinderClient';

export const metadata: Metadata = {
  title: 'Digital Binder — Collect, Organize & Trade Cards',
  description: 'Build your digital card binder. Collect sports cards and Pokemon cards, organize your collection, create a want list, and mark cards for trade. Free digital collecting experience — no account needed.',
  openGraph: {
    title: 'Digital Binder — CardVault',
    description: 'Build and share your digital card collection. Organize cards into collected, want list, and trade binder.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Digital Binder — CardVault',
    description: 'Collect, organize, and trade sports cards in your free digital binder.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Digital Binder' },
];

export default function BinderPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Digital Binder',
        url: 'https://cardvault-two.vercel.app/binder',
        description: 'Free digital card binder — collect, organize, and trade sports cards and Pokemon cards.',
        applicationCategory: 'CollectingApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <Breadcrumb items={breadcrumbs} />
      <BinderClient />
    </>
  );
}
