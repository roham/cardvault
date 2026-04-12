import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Card Collection — Track Sets & Estimate Value',
  description: 'Track your sports card and Pokémon TCG collection by set. See completion percentage, estimated value, and what\'s missing. No account required — saves in your browser.',
};

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
