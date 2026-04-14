import type { Metadata } from 'next';
import EmbedPriceCheck from './EmbedPriceCheck';

export const metadata: Metadata = {
  title: 'CardVault Price Check Widget',
  robots: 'noindex, nofollow',
};

export default function EmbedPriceCheckPage() {
  return <EmbedPriceCheck />;
}
