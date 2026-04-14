import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CreatorWidgets from './CreatorWidgets';

export const metadata: Metadata = {
  title: 'Creator Widgets — Embed CardVault on Your Content | CardVault',
  description: 'Free embeddable card price widgets for YouTube creators, TikTok content creators, bloggers, and card breakers. Add real-time card pricing to your website or content with a simple iframe embed.',
  openGraph: {
    title: 'Creator Widgets — CardVault',
    description: 'Free embeddable card price widgets. Add live pricing to your content with one line of code.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Creator Widgets — CardVault',
    description: 'Embed free card pricing widgets on your YouTube, blog, or website.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Creator Widgets' },
];

const faqItems = [
  {
    question: 'Are CardVault widgets free to use?',
    answer: 'Yes, all CardVault embeddable widgets are completely free. No API keys, no accounts, no fees. Embed them on your YouTube channel page, blog, Shopify store, or any website. We just ask that you keep the "Powered by CardVault" attribution.',
  },
  {
    question: 'How do I add a widget to my website?',
    answer: 'Copy the iframe embed code from any widget on this page and paste it into your website\'s HTML. The widget will automatically size itself to fit your container. Works with WordPress, Squarespace, Wix, Shopify, and any platform that supports HTML embeds.',
  },
  {
    question: 'Can I customize the widget appearance?',
    answer: 'Widgets support dark and light themes via the &theme=dark or &theme=light URL parameter. For card widgets, pass the card slug via &slug=card-slug-here. Width and height can be controlled via the iframe tag. More customization options coming soon.',
  },
  {
    question: 'Do widgets update automatically?',
    answer: 'Yes. Widgets pull data directly from CardVault\'s database each time they load. As we update card prices and add new cards, your embedded widgets reflect those changes automatically. No maintenance required on your end.',
  },
  {
    question: 'Can I embed widgets in YouTube descriptions?',
    answer: 'YouTube descriptions don\'t support iframes, but you can link to your website or blog that has the widget embedded. Many creators use a Linktree or personal site with CardVault widgets for their card-related content. You can also screenshot the widget for thumbnails.',
  },
];

export default function CreatorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Creator Widgets',
        description: 'Free embeddable card price widgets for content creators.',
        url: 'https://cardvault-two.vercel.app/creators',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Free Widgets - Embed Anywhere - Auto-Updating - No API Key
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Creator Widgets</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Embed free card pricing widgets on your YouTube channel, blog, Shopify store, or any website. Copy one line of code, paste it in, and your audience gets live card prices from CardVault.
        </p>
      </div>

      <CreatorWidgets />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">More Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/mcp" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🤖</span>
            <div>
              <div className="text-white text-sm font-medium">MCP Server API</div>
              <div className="text-gray-500 text-xs">For AI agents and developers</div>
            </div>
          </Link>
          <Link href="/tools" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🔧</span>
            <div>
              <div className="text-white text-sm font-medium">All Tools</div>
              <div className="text-gray-500 text-xs">26 free collector tools</div>
            </div>
          </Link>
          <Link href="/news" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📰</span>
            <div>
              <div className="text-white text-sm font-medium">News Feed</div>
              <div className="text-gray-500 text-xs">Latest card market news</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
