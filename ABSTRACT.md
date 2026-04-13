# CardVault: Autonomous Agent-Built Content Site for Physical Card Collectors

## What This Is

CardVault is a physical trading card content site — price guide, collector tools, editorial guides, set checklists, and card database — covering both sports cards and Pokémon TCG. It's live today at cardvault-two.vercel.app with 1,131 pages, 800+ sports cards, 20,218 Pokémon cards, and 15 editorial guides.

The entire site was built from scratch in a single session by AI agent swarms operating off approximately 140 words of human instruction. No designer. No frontend engineer. No content writer. One person prompting, agents building.

## The Goal

Build the world's best physical card content site by deploying autonomous AI agent swarms that continuously research, write, build, score, and improve — every day, at a pace that no one in the physical card space has ever seen. Then use that content authority as the natural bridge to wire in digital collectibles (Top Shot, Disney, etc.) in a way that feels native rather than forced.

## The Strategy

**Phase 1 — Content dominance via SEO.** Physical card collectors search Google constantly: "What is my 1986 Fleer Jordan worth?" "Best Pokémon cards to invest in." "How to spot fake cards." Every one of those queries is a page we can own. Agent swarms generate pages at scale — not generic AI slop, but research-backed content that passes the collector trust test. The scoring matrix enforces quality; the agents iterate until scores clear the bar.

**Phase 2 — Pokémon-first.** The research is clear: Pokémon TCG has better free data infrastructure (the Pokémon TCG API gives us 20,218 cards with live TCGPlayer prices for free), a younger demographic that skews digital-native, and a massive collector base that's underserved by existing tools. Sports cards are the complement, not the lead.

**Phase 3 — Wire in digital collectibles.** Once we own the content graph for physical cards, we add pages for NBA Top Shot Moments, Disney Pinnacle pins, and NFL ALL DAY alongside their physical equivalents. A collector looking at a LeBron rookie card page naturally sees "Also collect: LeBron Top Shot Moments" — not as an ad, but as a genuine extension of the collection. The cross-category positioning (physical + digital) becomes the moat that no pure-physical or pure-digital site can match.

## How It Was Built

The build followed a structured plan: 5 phases of market research (competitor analysis, persona development, data source discovery, scoring matrix design), then execution phases where AI agent swarms built the site autonomously.

In this session:
- **~140 words of human instruction** produced 22 git commits
- Agents ran ~30 improvement loops across 6 dispatches
- Each loop: research the weakest dimension → design an improvement → implement → verify build → score → repeat
- Mid-session, the human redirected agents back to the market research to validate the value prop — the agents self-corrected from "card encyclopedia" to "price checker" based on collector pain point data
- Final output: 1,131 static pages, 8.05/10 quality score (beating the top competitor benchmark of 7.3)

The key insight: the human's role was strategy and quality judgment ("it needs to be realistic, not just look good"), not implementation. The agents handled research, architecture, coding, data curation, content writing, deployment, and QA.

## Why This Matters Beyond CardVault

This is a proof-of-concept for autonomous agent development at Dapper. The pattern:

1. Write a plan with clear phases, scoring criteria, and agent roles
2. Point the swarm at it
3. Intervene only for strategy corrections and quality judgment
4. Let the agents loop: research → build → score → improve → repeat

If this pattern works for a content site, it works for internal tools, marketing campaigns, data pipelines, and product features. The question we're answering is: **Can you set up autonomous development loops that produce something genuinely good, not just something that exists?**

CardVault says yes — with the caveat that human taste and strategic redirection at key inflection points (not micromanagement of implementation) is what separates "impressive demo" from "thing a real person would use."

## Current State

- **Live**: cardvault-two.vercel.app
- **Repo**: github.com/roham/cardvault
- **Pages**: 1,131 (statically generated)
- **Sports cards**: 800+ with grade pricing, PSA populations, notable sales
- **Pokémon cards**: 20,218 with live TCGPlayer prices
- **Guides**: 15 (grading, investing, market analysis, fake detection, beginner start, "most valuable" lists)
- **Tools**: Set checklists, collection tracker, grade calculator, price lookup
- **Score**: 8.05/10 weighted (Content 8.5, Data 7.0, Search 8.0, Utility 8.5, Design 8.5, Content/Community 7.5, Technical 9.0)

## What's Next

- Custom domain
- Agent swarm on a cron: daily content generation, price updates, new card additions
- Pokémon content expansion (set reviews, meta analysis, sealed product guides)
- Digital collectibles integration (Top Shot Moments, Disney Pinnacle, NFL ALL DAY)
- eBay API for live sold data
- Community features (collection sharing, comments)
