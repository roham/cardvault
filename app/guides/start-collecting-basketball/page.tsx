import type { Metadata } from 'next';
import { starterKits } from '@/data/starter-kits';
import StarterKitPage from '@/components/StarterKitPage';

const kit = starterKits.basketball;

export const metadata: Metadata = {
  title: kit.title + ' | CardVault',
  description: kit.description,
  openGraph: { title: kit.title, description: kit.description, type: 'article' },
  twitter: { card: 'summary', title: kit.title, description: kit.description },
  alternates: { canonical: './' },
};

export default function Page() {
  return <StarterKitPage kit={kit} />;
}
