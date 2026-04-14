import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'CardVault MCP Server — AI Agent API for Sports Card Data',
  description: 'Connect your AI agent to CardVault via the Model Context Protocol (MCP). Search 3,000+ sports cards, compare players, calculate grading ROI, and evaluate sealed product EV.',
  alternates: { canonical: './' },
};

const tools = [
  {
    name: 'search_cards',
    desc: 'Search cards by player name, set, year, or sport',
    example: '{"method":"tools/call","params":{"name":"search_cards","arguments":{"query":"Trout","sport":"baseball","limit":3}},"id":1,"jsonrpc":"2.0"}',
  },
  {
    name: 'get_card_price',
    desc: 'Get estimated raw and graded values for a card',
    example: '{"method":"tools/call","params":{"name":"get_card_price","arguments":{"player":"Mike Trout","year":2011}},"id":2,"jsonrpc":"2.0"}',
  },
  {
    name: 'grading_roi',
    desc: 'Calculate grading ROI for PSA, CGC, or SGC',
    example: '{"method":"tools/call","params":{"name":"grading_roi","arguments":{"raw_value":150,"company":"psa","expected_grade":9}},"id":3,"jsonrpc":"2.0"}',
  },
  {
    name: 'sealed_product_ev',
    desc: 'Calculate expected value of sealed card products',
    example: '{"method":"tools/call","params":{"name":"sealed_product_ev","arguments":{"product_name":"Prizm Basketball"}},"id":4,"jsonrpc":"2.0"}',
  },
  {
    name: 'list_sets',
    desc: 'List card sets with counts and completion costs',
    example: '{"method":"tools/call","params":{"name":"list_sets","arguments":{"sport":"baseball","year":2024}},"id":5,"jsonrpc":"2.0"}',
  },
  {
    name: 'player_lookup',
    desc: 'Get all cards for a player with portfolio value',
    example: '{"method":"tools/call","params":{"name":"player_lookup","arguments":{"player":"Shohei Ohtani"}},"id":6,"jsonrpc":"2.0"}',
  },
  {
    name: 'compare_players',
    desc: 'Compare two players side-by-side with investment analysis',
    example: '{"method":"tools/call","params":{"name":"compare_players","arguments":{"player_a":"Mike Trout","player_b":"Shohei Ohtani"}},"id":7,"jsonrpc":"2.0"}',
  },
];

export default function McpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebAPI',
        'name': 'CardVault MCP Server',
        'description': 'Model Context Protocol server for sports card data, pricing, grading ROI, and sealed product EV calculations.',
        'url': 'https://cardvault-two.vercel.app/api/mcp',
        'documentation': 'https://cardvault-two.vercel.app/mcp',
        'provider': { '@type': 'Organization', 'name': 'CardVault' },
      }} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-300">MCP Server</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-white">CardVault MCP Server</h1>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">v3.7</span>
        </div>
        <p className="text-gray-400 text-xl leading-relaxed mb-6">
          Connect your AI agent to the largest free sports card database via the
          {' '}<span className="text-white font-medium">Model Context Protocol</span>.
          Search 3,000+ cards, compare players, calculate grading ROI, and evaluate sealed product expected value.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">7 Tools</span>
          <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">3,000+ Cards</span>
          <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">900+ Players</span>
          <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">4 Sports</span>
          <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">Free</span>
        </div>
      </div>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">1. Add to your MCP client config:</p>
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-sm text-emerald-400 overflow-x-auto">
{`{
  "mcpServers": {
    "cardvault": {
      "url": "https://cardvault-two.vercel.app/api/mcp",
      "transport": "http"
    }
  }
}`}
            </pre>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">2. Or use curl to test:</p>
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-sm text-emerald-400 overflow-x-auto">
{`curl -X POST https://cardvault-two.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"method":"tools/list","id":1,"jsonrpc":"2.0"}'`}
            </pre>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">3. Discovery endpoint:</p>
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-sm text-emerald-400 overflow-x-auto">
{`GET https://cardvault-two.vercel.app/.well-known/mcp.json`}
            </pre>
          </div>
        </div>
      </section>

      {/* Available Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Available Tools</h2>
        <div className="space-y-6">
          {tools.map((tool) => (
            <div key={tool.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-emerald-400 font-mono font-bold text-lg">{tool.name}</code>
              </div>
              <p className="text-gray-400 mb-4">{tool.desc}</p>
              <details className="group">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                  Example request
                </summary>
                <pre className="mt-3 bg-gray-950 border border-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                  {JSON.stringify(JSON.parse(tool.example), null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* Protocol Details */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Protocol Details</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="px-6 py-3 text-gray-400 font-medium">Protocol</td>
                <td className="px-6 py-3 text-white">Model Context Protocol (MCP)</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="px-6 py-3 text-gray-400 font-medium">Version</td>
                <td className="px-6 py-3 text-white">2024-11-05</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="px-6 py-3 text-gray-400 font-medium">Transport</td>
                <td className="px-6 py-3 text-white">HTTP (Streamable HTTP)</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="px-6 py-3 text-gray-400 font-medium">Format</td>
                <td className="px-6 py-3 text-white">JSON-RPC 2.0</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="px-6 py-3 text-gray-400 font-medium">Endpoint</td>
                <td className="px-6 py-3 font-mono text-emerald-400">POST /api/mcp</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="px-6 py-3 text-gray-400 font-medium">Discovery</td>
                <td className="px-6 py-3 font-mono text-emerald-400">GET /.well-known/mcp.json</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-400 font-medium">Auth</td>
                <td className="px-6 py-3 text-white">None (free, public)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Use Cases */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Use Cases</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'AI Price Lookup', desc: 'Ask your AI assistant "What is a 1986 Fleer Michael Jordan worth?" and get instant pricing data.' },
            { title: 'Portfolio Analysis', desc: 'Have your agent compare two players\' card portfolios to inform investment decisions.' },
            { title: 'Grading Decisions', desc: 'Calculate whether a card is worth sending to PSA, CGC, or SGC before spending money.' },
            { title: 'Sealed Product Analysis', desc: 'Evaluate the expected value of hobby boxes and blasters before buying.' },
            { title: 'Collection Building', desc: 'Search for rookie cards, filter by sport and year, and find the best cards to collect.' },
            { title: 'Market Research', desc: 'List sets, compare completion costs, and find undervalued collections.' },
          ].map((uc) => (
            <div key={uc.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{uc.title}</h3>
              <p className="text-gray-400 text-sm">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Related</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools" className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
            All Tools
          </Link>
          <Link href="/tools/grading-roi" className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
            Grading ROI Calculator
          </Link>
          <Link href="/tools/sealed-ev" className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
            Sealed Product EV
          </Link>
          <Link href="/tools/market-dashboard" className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
            Market Dashboard
          </Link>
          <Link href="/players" className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
            All Players
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the CardVault MCP Server?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'The CardVault MCP Server is a free API endpoint that lets AI agents and assistants search sports card data, check prices, calculate grading ROI, compare players, and evaluate sealed product expected value using the Model Context Protocol.' },
          },
          {
            '@type': 'Question',
            'name': 'How do I connect to the CardVault MCP Server?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Add the endpoint URL (https://cardvault-two.vercel.app/api/mcp) to your MCP client configuration. The server uses HTTP transport with JSON-RPC 2.0 protocol. No authentication required.' },
          },
          {
            '@type': 'Question',
            'name': 'What data does the CardVault MCP Server provide?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'The server provides access to 3,000+ sports cards across baseball, basketball, football, and hockey. It includes estimated raw and graded values, player information, set data, grading ROI calculations, and sealed product expected value analysis.' },
          },
          {
            '@type': 'Question',
            'name': 'Is the CardVault MCP Server free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, the CardVault MCP Server is completely free to use with no authentication required. It is the first MCP server dedicated to sports card collecting.' },
          },
        ],
      }} />
    </div>
  );
}
