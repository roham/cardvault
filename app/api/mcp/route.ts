import { NextRequest, NextResponse } from 'next/server';
import { sportsCards } from '@/data/sports-cards';
import { sealedProducts, calculateEV } from '@/data/sealed-products';

// CardVault MCP Server — exposes card data as tools for AI agents
// Spec: https://modelcontextprotocol.io

const TOOLS = [
  {
    name: 'search_cards',
    description: 'Search sports cards by player name, set, year, or sport. Returns card details with pricing.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (player name, set name, or card description)' },
        sport: { type: 'string', enum: ['baseball', 'basketball', 'football', 'hockey'], description: 'Filter by sport' },
        year: { type: 'number', description: 'Filter by year' },
        limit: { type: 'number', description: 'Max results (default 10)', default: 10 },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_card_price',
    description: 'Get the estimated value of a specific sports card, both raw and graded.',
    inputSchema: {
      type: 'object',
      properties: {
        player: { type: 'string', description: 'Player name' },
        year: { type: 'number', description: 'Card year' },
        set: { type: 'string', description: 'Set name (e.g. "Topps Chrome", "Panini Prizm")' },
      },
      required: ['player'],
    },
  },
  {
    name: 'grading_roi',
    description: 'Calculate the ROI of grading a card with PSA, CGC, or SGC. Input raw value, company, and expected grade.',
    inputSchema: {
      type: 'object',
      properties: {
        raw_value: { type: 'number', description: 'Current raw (ungraded) value in USD' },
        company: { type: 'string', enum: ['psa', 'cgc', 'sgc'], description: 'Grading company', default: 'psa' },
        expected_grade: { type: 'number', minimum: 1, maximum: 10, description: 'Expected grade (1-10)', default: 9 },
        service_tier: { type: 'string', enum: ['economy', 'standard', 'express'], description: 'Service speed tier', default: 'economy' },
      },
      required: ['raw_value'],
    },
  },
  {
    name: 'sealed_product_ev',
    description: 'Calculate the expected value (EV) of a sealed card product. Returns hit rates, EV breakdown, and ROI.',
    inputSchema: {
      type: 'object',
      properties: {
        product_name: { type: 'string', description: 'Product name or keyword (e.g. "Prizm Basketball", "Topps Chrome")' },
        sport: { type: 'string', enum: ['baseball', 'basketball', 'football', 'hockey', 'pokemon'], description: 'Filter by sport' },
      },
      required: ['product_name'],
    },
  },
  {
    name: 'list_sets',
    description: 'List available card sets with card counts and estimated completion costs.',
    inputSchema: {
      type: 'object',
      properties: {
        sport: { type: 'string', enum: ['baseball', 'basketball', 'football', 'hockey'], description: 'Filter by sport' },
        year: { type: 'number', description: 'Filter by year' },
      },
    },
  },
];

// Grading company data
const gradingCompanies: Record<string, { costs: Record<string, number>; shipping: number; multipliers: number[]; premium: number }> = {
  psa: { costs: { economy: 20, standard: 50, express: 100 }, shipping: 18, multipliers: [0.4, 0.5, 0.6, 0.75, 0.9, 1.1, 1.4, 2.0, 3.5, 5.5], premium: 1.0 },
  cgc: { costs: { economy: 15, standard: 30, express: 65 }, shipping: 16, multipliers: [0.35, 0.45, 0.55, 0.7, 0.85, 1.05, 1.3, 1.8, 3.0, 4.8], premium: 0.85 },
  sgc: { costs: { economy: 20, standard: 30, express: 50 }, shipping: 15, multipliers: [0.35, 0.45, 0.55, 0.7, 0.85, 1.0, 1.25, 1.7, 2.8, 4.5], premium: 0.80 },
};

function parseMidValue(val: string): number {
  const matches = val.match(/\$([\d,]+)/g);
  if (!matches || matches.length === 0) return 0;
  const nums = matches.map(m => parseInt(m.replace(/[$,]/g, ''), 10));
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0] + nums[1]) / 2);
}

function handleSearchCards(params: { query: string; sport?: string; year?: number; limit?: number }) {
  const q = params.query.toLowerCase();
  const limit = params.limit || 10;

  let results = sportsCards.filter(c => {
    const match = c.name.toLowerCase().includes(q) ||
      c.player.toLowerCase().includes(q) ||
      c.set.toLowerCase().includes(q);
    if (!match) return false;
    if (params.sport && c.sport !== params.sport) return false;
    if (params.year && c.year !== params.year) return false;
    return true;
  });

  return results.slice(0, limit).map(c => ({
    name: c.name,
    player: c.player,
    year: c.year,
    set: c.set,
    sport: c.sport,
    card_number: c.cardNumber,
    rookie: c.rookie,
    raw_value: c.estimatedValueRaw,
    gem_mint_value: c.estimatedValueGem,
    ebay_url: c.ebaySearchUrl,
    cardvault_url: `https://cardvault-two.vercel.app/sports/${c.slug}`,
  }));
}

function handleGetCardPrice(params: { player: string; year?: number; set?: string }) {
  const p = params.player.toLowerCase();
  let results = sportsCards.filter(c => c.player.toLowerCase().includes(p));
  if (params.year) results = results.filter(c => c.year === params.year);
  if (params.set) results = results.filter(c => c.set.toLowerCase().includes(params.set!.toLowerCase()));

  if (results.length === 0) {
    return { error: `No cards found for player "${params.player}"`, suggestion: 'Try searching with just the last name.' };
  }

  return results.slice(0, 5).map(c => ({
    name: c.name,
    player: c.player,
    year: c.year,
    set: c.set,
    raw_value: c.estimatedValueRaw,
    gem_mint_value: c.estimatedValueGem,
    raw_mid_estimate: parseMidValue(c.estimatedValueRaw),
    gem_mid_estimate: parseMidValue(c.estimatedValueGem),
    cardvault_url: `https://cardvault-two.vercel.app/sports/${c.slug}`,
  }));
}

function handleGradingROI(params: { raw_value: number; company?: string; expected_grade?: number; service_tier?: string }) {
  const company = gradingCompanies[params.company || 'psa'];
  const grade = params.expected_grade || 9;
  const tier = params.service_tier || 'economy';
  const cost = (company.costs[tier] || company.costs.economy) + company.shipping;
  const multiplier = company.multipliers[grade - 1];
  const gradedValue = params.raw_value * multiplier * company.premium;
  const profit = gradedValue - params.raw_value - cost;

  return {
    raw_value: params.raw_value,
    grading_company: params.company || 'psa',
    expected_grade: grade,
    service_tier: tier,
    grading_cost: cost,
    estimated_graded_value: Math.round(gradedValue),
    expected_profit: Math.round(profit),
    roi_percent: Math.round((profit / cost) * 100),
    worth_grading: profit > 0,
    recommendation: profit > 100 ? 'Definitely grade this card' : profit > 0 ? 'Marginal — grade if you\'re confident in the grade' : 'Not worth grading at this value',
    calculator_url: 'https://cardvault-two.vercel.app/tools/grading-roi',
  };
}

function handleSealedProductEV(params: { product_name: string; sport?: string }) {
  const q = params.product_name.toLowerCase();
  let results = sealedProducts.filter(p => p.name.toLowerCase().includes(q));
  if (params.sport) results = results.filter(p => p.sport === params.sport);

  if (results.length === 0) {
    return { error: `No products found matching "${params.product_name}"`, available_products: sealedProducts.map(p => p.name) };
  }

  return results.slice(0, 3).map(p => {
    const ev = calculateEV(p);
    return {
      name: p.name,
      sport: p.sport,
      type: p.type,
      retail_price: p.retailPrice,
      expected_value: Math.round(ev.expectedValue),
      expected_profit: Math.round(ev.roi),
      roi_percent: Math.round(ev.roiPercent),
      packs_per_box: p.packsPerBox,
      cards_per_pack: p.cardsPerPack,
      hit_breakdown: ev.hitBreakdown.map(h => ({
        insert_type: h.insert,
        expected_hits: Math.round(h.expectedHits * 10) / 10,
        expected_value: Math.round(h.expectedValue),
      })),
      calculator_url: 'https://cardvault-two.vercel.app/tools/sealed-ev',
    };
  });
}

function handleListSets(params: { sport?: string; year?: number }) {
  const setMap = new Map<string, { name: string; sport: string; year: number; count: number; totalValue: number }>();

  for (const card of sportsCards) {
    if (params.sport && card.sport !== params.sport) continue;
    if (params.year && card.year !== params.year) continue;

    const existing = setMap.get(card.set);
    const val = parseMidValue(card.estimatedValueRaw);
    if (existing) {
      existing.count++;
      existing.totalValue += val;
    } else {
      setMap.set(card.set, { name: card.set, sport: card.sport, year: card.year, count: 1, totalValue: val });
    }
  }

  return Array.from(setMap.values())
    .filter(s => s.count >= 3)
    .sort((a, b) => b.year - a.year || b.count - a.count)
    .slice(0, 30)
    .map(s => ({
      name: s.name,
      sport: s.sport,
      year: s.year,
      cards_in_database: s.count,
      estimated_completion_cost: s.totalValue,
      browse_url: `https://cardvault-two.vercel.app/sports/sets`,
    }));
}

// Handle MCP JSON-RPC requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params, id } = body;

    // MCP initialize
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'cardvault',
            version: '2.5.0',
            description: 'CardVault MCP Server — sports card and Pokemon card data, pricing, grading ROI, and sealed product EV calculations.',
          },
        },
      });
    }

    // List tools
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS },
      });
    }

    // Call tool
    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      let result;
      switch (toolName) {
        case 'search_cards':
          result = handleSearchCards(toolArgs);
          break;
        case 'get_card_price':
          result = handleGetCardPrice(toolArgs);
          break;
        case 'grading_roi':
          result = handleGradingROI(toolArgs);
          break;
        case 'sealed_product_ev':
          result = handleSealedProductEV(toolArgs);
          break;
        case 'list_sets':
          result = handleListSets(toolArgs);
          break;
        default:
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown tool: ${toolName}` },
          });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        },
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Unknown method: ${method}` },
    });
  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' },
    }, { status: 400 });
  }
}

// GET endpoint for discovery
export async function GET() {
  return NextResponse.json({
    name: 'cardvault',
    version: '2.5.0',
    description: 'CardVault MCP Server — search 1,000+ sports cards, check prices, calculate grading ROI, and evaluate sealed product expected value.',
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
    endpoints: {
      mcp: 'https://cardvault-two.vercel.app/api/mcp',
    },
    documentation: 'https://cardvault-two.vercel.app/tools',
    total_sports_cards: sportsCards.length,
    total_sealed_products: sealedProducts.length,
  });
}
