import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New to Card Collecting? Start Here — CardVault',
  description: 'Three questions to find the right tool for you. Whether you want to check card values, track a collection, or learn the hobby — we\'ll point you to exactly the right place.',
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
