import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    schema_version: '1',
    server: {
      name: 'cardvault',
      description: 'CardVault — the largest free sports card database with pricing, grading ROI calculations, player comparisons, and sealed product EV analysis. Search 3,000+ cards across baseball, basketball, football, and hockey.',
      url: 'https://cardvault-two.vercel.app/api/mcp',
      transport: 'http',
      version: '3.7.0',
    },
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
    documentation: 'https://cardvault-two.vercel.app/mcp',
    contact: {
      website: 'https://cardvault-two.vercel.app',
    },
  });
}
