import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketWeatherClient from './MarketWeatherClient';

export const metadata: Metadata = {
  title: 'Card Market Weather Report — Daily Sports Card Market Conditions | CardVault',
  description: 'Check today\'s card market conditions at a glance. Weather-style forecast for baseball, basketball, football, and hockey cards. Temperature gauges, 5-day outlook, market alerts, and expert commentary. Free daily updates.',
  openGraph: {
    title: 'Card Market Weather Report — CardVault',
    description: 'Daily card market conditions. Weather-style forecast for all four major sports card markets.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Weather Report — CardVault',
    description: 'Is the card market sunny or stormy today? Check the daily weather report.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market Weather' },
];

const faqItems = [
  {
    question: 'What is the Card Market Weather Report?',
    answer: 'The Card Market Weather Report is a daily dashboard that presents sports card market conditions using an intuitive weather metaphor. Each sport (baseball, basketball, football, hockey) gets a weather condition (sunny, cloudy, rainy, stormy) and temperature reading from -100 to +100. Sunny means high demand and rising prices. Stormy means high volatility with unpredictable price swings. The 5-day forecast shows upcoming events that could impact the market.',
  },
  {
    question: 'How is the market temperature calculated?',
    answer: 'Market temperature is based on seasonal demand patterns for each sport. During a sport\'s peak season (playoffs, drafts, championships), the temperature is high (positive numbers). During the off-season, temperatures drop to negative numbers. Daily variance is added for realism. A temperature of +80 means very high demand — cards are moving fast. A temperature of -40 means very low demand — the market is quiet for that sport.',
  },
  {
    question: 'What do the alert levels mean?',
    answer: 'Alert levels indicate overall market conditions: All Clear (green) means normal trading, no major catalysts ahead. Market Watch (yellow) means upcoming events could cause volatility. Advisory (orange) means active catalysts are in play — expect price movement. Storm Warning (red) means a major market event is happening right now — the NFL Draft, Super Bowl, or championship series. Storm Warning days see the highest price volatility of the year.',
  },
  {
    question: 'Should I buy or sell based on the weather report?',
    answer: 'The weather report helps you understand current market conditions, but it\'s not a direct buy/sell signal. Generally, buying during "rainy" or "cloudy" conditions (off-season, low demand) gets you better prices. Selling during "sunny" conditions (peak season, high demand) maximizes returns. "Stormy" conditions mean high volatility — experienced traders find opportunities, but beginners should be cautious and avoid impulse decisions.',
  },
];

export default function MarketWeatherPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Market Weather Report',
        description: 'Daily sports card market conditions dashboard with weather-style forecasts, temperature gauges, and 5-day outlooks for baseball, basketball, football, and hockey cards.',
        url: 'https://cardvault-two.vercel.app/market-weather',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          Updated Daily - 4 Sports - 5-Day Forecast
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Market Weather Report
        </h1>
        <p className="text-white/60 text-lg max-w-3xl">
          Your daily check on card market conditions. See which sports are hot, which are cooling off, and what events are on the horizon — all presented in an intuitive weather format. Check back daily for updated forecasts.
        </p>
      </div>

      <MarketWeatherClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
              <h3 className="text-base font-semibold text-white/90 mb-2">{faq.question}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <p className="text-white/50 text-sm mb-4">
          Want more market intelligence?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/seasonal-calendar" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Seasonal Calendar
          </Link>
          <Link href="/market-analysis" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Daily Analysis
          </Link>
          <Link href="/market-heatmap" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Market Heat Map
          </Link>
          <Link href="/tools" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
