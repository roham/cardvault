import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MyHubClient from './MyHubClient';

export const metadata: Metadata = {
  title: 'My Hub — Your Collector Dashboard',
  description: 'Your personal CardVault dashboard. Track your streak, daily packs, achievements, watchlist, and collection progress all in one place.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'My Hub — CardVault',
    description: 'Your personal collector dashboard. Track streaks, packs, achievements, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'My Hub — CardVault',
    description: 'Your personal collector dashboard with streaks, achievements, and daily packs.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'My Hub' },
];

export default function MyHubPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'My Hub — Collector Dashboard',
        description: 'Personal CardVault dashboard for tracking streaks, achievements, packs, and collection progress.',
        url: 'https://cardvault-two.vercel.app/my-hub',
      }} />

      <MyHubClient />
    </div>
  );
}
