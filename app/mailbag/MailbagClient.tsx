'use client';

import { useMemo, useState } from 'react';

type Category = 'selling' | 'grading' | 'family' | 'investing' | 'storage' | 'ethics';

interface Letter {
  handle: string;
  location: string;
  category: Category;
  subject: string;
  question: string;
  answer: string[];
}

const CATEGORY_META: Record<Category, { label: string; activeClass: string; emoji: string }> = {
  selling: { label: 'Selling', activeClass: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200', emoji: '💵' },
  grading: { label: 'Grading', activeClass: 'border-sky-500/60 bg-sky-500/15 text-sky-200', emoji: '🔍' },
  family: { label: 'Family', activeClass: 'border-rose-500/60 bg-rose-500/15 text-rose-200', emoji: '🏡' },
  investing: { label: 'Investing', activeClass: 'border-amber-500/60 bg-amber-500/15 text-amber-200', emoji: '📈' },
  storage: { label: 'Storage', activeClass: 'border-violet-500/60 bg-violet-500/15 text-violet-200', emoji: '🗄️' },
  ethics: { label: 'Ethics', activeClass: 'border-fuchsia-500/60 bg-fuchsia-500/15 text-fuchsia-200', emoji: '⚖️' },
};

const LETTERS: Letter[] = [
  {
    handle: 'GriffeyKidDad',
    location: 'Cincinnati, OH',
    category: 'family',
    subject: 'My wife says the collection has to go',
    question: 'I have spent about $14,000 on cards over six years. My wife gave me an ultimatum last week — sell most of it or sleep in the basement. I know she is right that I overspent, but I also know if I panic-sell into eBay this weekend I lose half the money. What do I actually do?',
    answer: [
      'First, your wife is not the villain here, and neither are you. She is telling you that the hobby crossed a line from pleasure into pressure. That is a real marriage problem, not a card problem. Do not sell anything yet.',
      'Here is the sequence. Tonight, sit down with her and agree on a number — not "sell most of it" (too vague), but a specific dollar target and a specific deadline. Ninety days is fair. Put it in writing on the fridge.',
      'Next weekend, separate your collection into three piles: (1) the 10–15 cards you would actively fight to keep, (2) the middle bulk that would take weeks of listing to move, (3) anything under $50 that is eating storage and attention. Sell the bottom pile first in one or two bulk lots to a reputable dealer for 60-70 cents on the dollar — yes, you will lose some, but you will also free up the weekend hours that have been eating at your marriage. That matters more than the $400 you left on the table.',
      'The middle pile goes on eBay over the next 60 days, five to ten listings a week, seven-day auctions ending Sunday night. The keepers stay. When you hit the target, stop. Do not push for more — the goal is not to liquidate, it is to rebuild trust.',
      'One more thing: show her the spreadsheet when you are done. Not to prove anything. To make the invisible visible. The cards were the symptom.',
    ],
  },
  {
    handle: 'RawFirstTimer',
    location: 'Albany, NY',
    category: 'grading',
    subject: 'Should I grade my Luka Doncic Prizm rookie?',
    question: 'I pulled a 2018 Prizm Luka base rookie from a retail blaster back in 2019. It has lived in a toploader ever since. Centering looks 55/45, corners sharp, surface clean. Do I submit it to PSA?',
    answer: [
      'Before the math, the honest question: is this card ever going to leave your collection? If the answer is no, a raw Luka Prizm with clean corners is a wonderful thing to own, and the $30 submission plus a 90-day wait gets you a plastic brick to put on a shelf.',
      'If you are holding for eventual sale, the math does tip. A PSA 10 Luka Prizm base rookie is worth several multiples of a PSA 9, and a PSA 9 is worth a real premium over a raw copy because the raw market is now so saturated with "looks like a 10" examples that buyers discount accordingly. Your 55/45 centering is the risk factor — PSA 10 typically wants 50/50 or tighter. You are more likely a 9.',
      'So: submit to PSA Value tier ($25/card, around 65 business days at current turnaround). Expected outcome weighted by your description is roughly 55% chance of PSA 10, 35% PSA 9, 10% PSA 8. Your expected value on a $30 submission against 2026 market comps is positive — but not so positive that it makes sense if you already know you want to keep it.',
      'Answer the keep-or-sell question first. The grade follows.',
    ],
  },
  {
    handle: 'WidowedCollector',
    location: 'Tacoma, WA',
    category: 'selling',
    subject: 'My late husband left me 40 binders',
    question: 'My husband passed in February. He was a baseball card collector from 1978 to 2023 and I have 40 binders, 12 graded cards, and eight unopened wax boxes from the 1980s. I do not know what anything is worth. Dealers keep calling me after seeing the obituary. What do I do first?',
    answer: [
      'I am sorry for your loss, and I am angrier than I can say about the dealers who read obituaries and dial. Do not sell anything to any of them this month. Most of those calls are predatory by design — they assume you are overwhelmed and will take the first offer. You are not obligated to answer a single one.',
      'Here is the first step: do nothing with the cards for 30 days. Put the binders and the sealed wax somewhere climate-controlled (closet, not garage, not attic). The cards are fine sitting. You are not.',
      'Second step, when you are ready: hire an independent appraiser before you hire anyone else. Someone like Heritage Auctions, PWCC Auctions, or Love of the Game Auctions will do a free estimate of bulk collections — and unlike the dealers who called, they work on commission from an auction, which means they want the highest price, not the lowest. Your sealed 1980s wax is the headline — boxes from 1984 Fleer, 1986 Topps, or 1989 Upper Deck can be worth four or five figures each depending on the product. Unsealed vintage binders are usually worth less than people hope, but the graded cards might surprise you.',
      'Third: if you want to keep one or two cards as a keepsake, pick them before you sell. The collection was his love language. Holding onto a binder of 1975 Topps or whatever set meant the most to him is not sentimental clutter, it is memory. Everything else can go to auction and the proceeds go to you.',
    ],
  },
  {
    handle: 'OverLeveragedFlipper',
    location: 'Phoenix, AZ',
    category: 'investing',
    subject: 'I took out a HELOC to buy wax',
    question: 'This is stupid and I know it. I pulled $40k from a home equity line to buy 2024 Topps Chrome cases when they dropped. The market is soft, I have not flipped enough of the product, and the HELOC payment is $380 a month. I have 15 cases and enough cash for three more payments. What is the move?',
    answer: [
      'Stop. Put the checkbook down. I need you to hear me before the numbers: the home is not the collateral here, your marriage and your credit are. Fix the cash flow first and the cards second.',
      'Call the HELOC lender today and ask for a temporary payment restructure. Many lenders will move you to interest-only for 6-12 months if you call before you miss. That buys you real runway.',
      'Now the inventory. Do not liquidate all 15 cases at once — you will crater the price on the category you are long on. Sell two cases in the next two weeks on Whatnot or to a bulk buyer to get three to four months of HELOC cushion in cash. Hold the remaining thirteen through the spring release gap when 2024 Chrome supply tightens a bit as retail dries up. Pull prices tend to firm after the immediate post-release dump.',
      'If you cannot get the HELOC payment below what you can actually cover from non-card income, sell more and sooner. A card loss is a dollar loss. A missed home-equity payment is a credit event that costs years.',
      'Last thing: do not buy another case until the HELOC is at zero. Not one. Write that on a Post-it and put it on your monitor.',
    ],
  },
  {
    handle: 'BinderInBasement',
    location: 'Grand Rapids, MI',
    category: 'storage',
    subject: 'Humidity got into my binders',
    question: 'Checked on my binders after a rainy weekend and found a musty smell. Nothing visible — no mold, no warping — but the air in the basement definitely moved through the sleeves. About 600 cards, maybe 20 of them worth over $50 each. How screwed am I?',
    answer: [
      'Smell is a warning, not a verdict. If you caught it before visible mold or warping, you probably still have time — but the clock is real.',
      'Tonight, move everything upstairs to a climate-controlled room. Not near a window, not on a radiator, not in direct sun. A closet shelf on the main floor is fine. Buy a $15 digital hygrometer and a desiccant packet set from Amazon — aim for 45-55% humidity, 65-72°F. That is not negotiable for the next thirty days.',
      'For the 20 cards worth over $50, pull each one from its sleeve. Lay them face-up on a clean paper towel on a flat surface for 48 hours in the stable-humidity room. If any one of them shows curl, warp, or spotting after 48 hours, isolate it immediately — humidity damage spreads card-to-card through shared paper fibers.',
      'Do not try to "dry" cards aggressively with a fan or a hair dryer. That causes worse warping than the humidity itself. Slow ambient recovery is the only safe path.',
      'Long-term: the basement is never going to be safe storage. Even a finished basement swings 15-20 points of humidity across seasons in Michigan. Anything you care about goes upstairs, permanently.',
    ],
  },
  {
    handle: 'ShopRatConflicted',
    location: 'Nashville, TN',
    category: 'ethics',
    subject: 'The LCS owner is underpaying a teenager',
    question: 'I am a regular at my local card shop. There is a 16-year-old kid who comes in with cards he pulled or traded for, and the owner pays him maybe 30 cents on the dollar — sometimes less — because the kid does not know any better. It is legal but it makes me sick. Do I say something?',
    answer: [
      'You already know the answer or you would not have written to me. The question is what form the "something" takes.',
      'Option one, the confrontational path: call the owner out the next time the kid is in the shop. This feels righteous, and it will absolutely end with the owner kicking both of you out and the kid still selling to the same dealer next week at the same ratio. Low efficacy, high cost. Skip it.',
      'Option two, the practical path: talk to the kid directly, privately, outside the shop. Tell him what the cards are actually worth. Show him how to check VCP or Card Ladder comps on his phone. Show him what an eBay 30-day sold average looks like. Tell him he can also sell to other dealers, consign to auction at 90 days delay, or post to a Facebook group for a cash trade. Teach him the skill the owner is profiting from him not having. That is worth a hundred confrontations.',
      'Option three, the systemic path: start a casual monthly "what is this card worth" session at the library or a coffee shop for the younger collectors in your circle. Three or four kids get literacy and the shop owner loses his arbitrage overnight. The market solves the problem.',
      'The owner is not going to become a better person because you scolded him. But the kid can become a better seller in one weekend. Go find the kid.',
    ],
  },
  {
    handle: 'NewCollectorCuriousKid',
    location: 'Eugene, OR',
    category: 'investing',
    subject: 'Is Bowman Chrome prospect auto worth it for a 14yo?',
    question: 'My 14-year-old son wants to spend his birthday money ($200) on Bowman Chrome prospect autos of players not yet in the majors. I do not want to be the dad who kills a kid\'s hobby but I also do not want him thinking he found a get-rich scheme. What is the right read?',
    answer: [
      'Do not be the dad who kills it. Be the dad who teaches it. There is a real difference.',
      'The honest truth about Bowman Chrome prospect autos: about 3-5% of any given prospect class eventually reaches a card-market outcome that returns more than the buy-in. The other 95% either never make the majors, make it briefly and fade, or make it without the card market rewarding them. The odds are bad and they are public information — Jose Rodriguez is the cautionary poster child, and every dealer remembers 30 more. This is venture-capital economics applied to 14-year-old boys. That is a problem.',
      'But it is also great learning if you frame it right. Give him the $200 with three conditions: he picks 10 prospects he researched himself (not influencer picks), he writes one paragraph per pick on why he chose them, and he agrees in advance that in five years this either paid off or it did not, and he will not chase more money to make it up. That is a real investing lesson compressed into a hobby he already loves.',
      'If you want to hedge, have him split the $200 — $100 on prospect autos, $100 on established rookie autos of current MLB stars he likes. He gets exposure to both speculation and established talent, and he learns which one actually performed.',
      'He is not going to get rich. He might end up with one PSA 10 auto of a future All-Star he picked at 14. That is a story he will keep his whole life, and the $200 will be worth it whether the card is or not.',
    ],
  },
  {
    handle: 'SealedSallyPA',
    location: 'Lancaster, PA',
    category: 'storage',
    subject: 'Is my sealed wax safe in the garage?',
    question: 'I have about $18,000 in sealed hobby boxes — 2020 Prizm Football, 2018 Topps Chrome Baseball, some Bowman Chrome. They are on a metal shelf in my detached garage. Summer hits 95°F, winter drops to 30°F. Am I ruining them?',
    answer: [
      'Yes. You are. I say that with love.',
      'Sealed wax is not invincible. Two things kill it: temperature swings that stress the shrink wrap and the print quality of the cards inside, and humidity that gets through that shrink wrap and warps the edge of the stack sitting at the front of the box. A garage that swings 65 degrees across seasons does both.',
      'What you cannot see is that the glue on 2018 Topps Chrome wax packs becomes brittle at 30°F and gummy at 95°F. After three or four full cycles, the foil wrapping can crack at the crimp. That is not a "maybe," that is the chemistry.',
      'Tonight: get it out of the garage. I do not care where it goes first — spare bedroom, under the bed, a closet — as long as it is inside climate-controlled walls. The total volume of 18K worth of sealed wax is about four to six Home Depot totes. It fits.',
      'Long-term, if you want to keep collecting sealed at this volume: rent a climate-controlled storage unit for $50-80/month (many PWCC, Heritage, and independent vault services will store sealed for less with authentication), or buy a small home safe rated for document storage — they run about $300 for one that holds 15-20 boxes. Either is cheap insurance against a garage problem.',
    ],
  },
  {
    handle: 'BreakRoomRegular',
    location: 'Rochester, NY',
    category: 'ethics',
    subject: 'My favorite breaker is shilling his own slots',
    question: 'A breaker I have watched for two years has been live-bidding on his own auction slots through a second account. I saw the exact wording repeated in both accounts, and the prices mysteriously always end $5-10 above my bid and then the "other bidder" goes dark. What do I do?',
    answer: [
      'If you are sure, and it sounds like you are sure, you have three tools: the platform, the community, and your own wallet.',
      'The platform first. Whatnot and Fanatics Live both have direct-report flows for self-bidding and shill bidding. File a formal report with the breaker\'s handle, the date-time of the livestream, timestamps of the suspect bids, and — this is what makes it actionable — screen recordings if you still have access to stream archives. One report with evidence gets a breaker a 30-day suspension. Three reports from three different viewers in 90 days gets a permanent ban. Do not skip this step because you think it will not work. Platform enforcement is quiet but real.',
      'The community second. Post a factual account, not a rant, in the r/Whatnot or r/sportscards thread for the week. "I noticed X on Y date at Z time" — no accusations, just the observation. If others have seen the same pattern they will show up in the replies, and community pressure closes the accounts the platform misses.',
      'Your wallet third, and this is the hardest: stop buying from that room. Stop watching. Every viewer-hour you give a shill breaker is a dollar of ad-equivalent value you are handing them. You can mourn a favorite without funding them.',
      'One caveat: be very sure before you post. "The bids felt sus" is not enough. Timestamps, repeated language across accounts, and bid-pattern evidence are. If you are only 70% sure, file the platform report and skip the Reddit post.',
    ],
  },
  {
    handle: 'DivorcedMomSingleIncome',
    location: 'Bakersfield, CA',
    category: 'family',
    subject: 'My ex took cards from our son in the divorce',
    question: 'My ex kept the majority of our 10-year-old\'s baseball card collection — cards my son bought with his own allowance and received as gifts — when he moved out. These are my son\'s cards, not marital property. Our son is devastated. What do I do?',
    answer: [
      'This is not a card problem. This is a custody-adjacent property issue, and I am only going to say the generally-true thing here: in most US states, property that belongs to a minor child is not subject to division in divorce. Your son\'s cards are your son\'s cards.',
      'Step one: write down the list. Every card your son and you can remember — specifically — with approximate date acquired and, where you have them, photos or receipts. Memory is going to soften over the next six months; capture it now.',
      'Step two: email your ex, in writing, requesting the return of your son\'s personal property. Keep it short. No accusations. "Returning the following items that are [son\'s name]\'s personal belongings: [list]." Attach photos. Ask for a response within 14 days. Save your sent copy.',
      'Step three: if he refuses or ignores it, forward the chain to your divorce attorney. Most family law attorneys will send a follow-up letter as part of your existing retainer at no additional charge. A lawyer\'s letterhead changes things. If he still refuses, small claims court handles personal property disputes under $10,000 in most states — filing fee is typically $50-100 and no lawyer is required.',
      'Talk to your son. Tell him the cards are coming back. If they do not come back, tell him the truth too: that the cards mattered, that it was wrong, and that this is not going to be the last unfair thing in his life, but it is a thing you are going to fight. He will remember you fighting it more than he will remember the cards.',
    ],
  },
  {
    handle: 'TrimmerSuspicion',
    location: 'St. Louis, MO',
    category: 'ethics',
    subject: 'I think I bought a trimmed card',
    question: 'I paid $4,800 for a 1986 Fleer Michael Jordan PSA 8 on eBay. When I got it, something looks off — the left edge is very slightly sharper than the right, the ratio is a hair short. PSA graded it. But I am now paranoid. Is there a way to know?',
    answer: [
      'First: if PSA graded it and encapsulated it, their financial guarantee is the card is not trimmed. If it turns out it was trimmed after they graded it and before you bought it, that is on the cracker, not on PSA, and the graded slab would show tampering that any reholder can see. If it was trimmed before PSA graded it and they missed it, you have recourse — but trim-detection has been aggressive at PSA post-2018 and the odds of a slipped trim on a 1986 Fleer Jordan in 2026 are very low.',
      'That said, you paid $4,800, you can afford to verify. Three paths: (1) Send the slab to PSA for a Re-Grade/Authentication review — $125, about 60 business days, and they will measure the card in-slab. If it does not match the era-standard dimensions for 86 Fleer (2.495" x 3.495" ± 2%) they will flag it. (2) Take it to a major show (National, East Coast National, Chicago Sun-Times) and pay one of the on-site graders $20-40 for a measurement review. (3) Consign to a reputable auction house (Heritage, Goldin, PWCC) and let their intake pre-authenticate before listing — if it passes, you have third-party confirmation, and if it fails, you know before you have paid the trimmer.',
      'On the slight left/right asymmetry: 86 Fleer factory-cut variance was real. Many PSA 8 examples have a one-hair asymmetry that is not a trim. It is factory-printed poorly from the jump. Before you spiral, compare your card photo to 10-15 other PSA 8 86 Fleer Jordan comps. If yours looks within the population spread, you are probably fine. If yours looks off on both axes, then authenticate.',
    ],
  },
  {
    handle: 'BoomerBacktoHobby',
    location: 'Scottsdale, AZ',
    category: 'selling',
    subject: 'I have 12 longboxes from 1988-1994',
    question: 'I am 61. I stopped collecting in 1994. I have 12 longboxes of commons and semi-stars from the junk wax era — Upper Deck, Fleer, Topps, Donruss. Everyone says this stuff is worthless. What is the best thing to do with it?',
    answer: [
      'Everyone is not quite right, but they are closer to right than you want them to be. Here is the honest picture: 12 longboxes of junk-wax-era cards is roughly 12,000-15,000 cards. The wholesale-to-bulk-buyer price for generic 1988-1994 commons is about $30-50 per longbox, and you will be lucky to find a dealer who will even take them at that price because storage cost plus shipping often does not justify it.',
      'Three better paths:',
      '(1) Sort for the rookies. Spend four hours with a beer pulling every card of Ken Griffey Jr., Frank Thomas, Chipper Jones, Derek Jeter, Cal Ripken Jr., Roberto Alomar, John Smoltz, Tom Glavine, Mariano Rivera, Randy Johnson, Greg Maddux, Barry Larkin, Mike Piazza, and any Hall of Famer. The rookies from this era still have real pricing — not what you hoped, but $1-8 per card raw depending on condition. That is 1,000-1,500 cards at a nontrivial price. Sell those as a lot.',
      '(2) Gift the rest. Your local elementary school, a Boys and Girls Club, a Little League team, or a children\'s hospital will be thrilled to receive 12,000 baseball cards to use as goody bag fillers, reward tokens, or classroom prizes. The tax deduction if you itemize is about $0.01 per card ($120-150 total), and the goodwill is real.',
      '(3) Consign the high-condition complete sets. A full 1989 Upper Deck set with the #1 Ken Griffey Jr. rookie intact and in Near Mint condition is worth $80-150 even in 2026. 1991 Topps with the Chipper Jones rookie is worth $15-25. Check which complete sets you have before you bulk them.',
      'Do not pay eBay fees to list them individually. That is the one trap to avoid. Your time is worth more than the spread.',
    ],
  },
  {
    handle: 'GradedForTheWrongReason',
    location: 'Jersey City, NJ',
    category: 'grading',
    subject: 'I graded cards to flex on Instagram',
    question: 'Ok, embarrassing. I submitted a bunch of cards to PSA this year purely because graded cards look good in Instagram posts. Spent about $1,200 in fees. Most came back PSA 9 on cards worth maybe $40 raw — and the PSA 9 adds almost nothing. What do I do with these now?',
    answer: [
      'Embarrassing is not the right word. Human is the right word. You did a very human thing. Move on.',
      'The cards are what they are. Do not send them back for review, do not crack them out, do not try to resell the slabs at a loss — all of those are chasing sunk cost. Keep them in the slabs, put them on your shelf, and let them be pretty. Graded cards do display well. That is the consolation prize you already paid for.',
      'The real question is what you learn from it. Before your next submission, ask yourself two things: (1) What is the raw-to-slabbed spread on this specific card at this specific grade, minus the submission fee? If that math is not positive, you are paying for aesthetics — which is fine, just know you are. (2) Is this card something I want to hold for five-plus years? Slabbed cards are hard to sell quickly at fair price. If you might want to sell in a year, raw is often better.',
      'If the Instagram graded-card aesthetic was really the goal, buy already-graded slabbed commons in the $5-15 range and build a wall of them for your background. Same visual impact, none of the grading-fee bleed.',
      'You are fine. Post the shelf. Stop submitting.',
    ],
  },
  {
    handle: 'GrandmaInheritedABox',
    location: 'Knoxville, TN',
    category: 'family',
    subject: 'My grandma mailed me a shoebox',
    question: 'My 87-year-old grandma mailed me a shoebox of my late grandpa\'s cards. I think it is mostly 50s and 60s baseball. I have never collected. I do not want to sell his memory for cash but I also have $31,000 in student loans. Is it okay to sell them?',
    answer: [
      'It is okay. It is absolutely, entirely okay. Your grandfather would not want his cards to be the reason you carry debt into your thirties. Sentimental cards are for the living. Cash is too.',
      'But before you list anything: call your grandmother. Not to ask permission — she already gave it by mailing the box. Ask her to tell you the story of each card she remembers. Which ones did grandpa talk about? Which player did he love? Which card did he chase for years? Write it down. Take photos of the cards with her voice memos attached. That is the inheritance. The cardboard is the delivery mechanism.',
      'Then, pick one to five cards that have a story she told you, and put those in a frame you keep. Not the most valuable ones — the most storied. A 1961 Topps Roger Maris he got the summer Maris broke the record has more weight than a Mantle with no story. Keep those forever.',
      'Everything else goes to auction. Call Heritage Auctions, PWCC, or Love of the Game — all three will give you a free estimate on a 1950s-1960s collection. Reputable auction houses handle estate sales like this every week and the commission is typically 15-20%, well worth the price discovery. Sixty days later, you get a check. Apply it to the highest-interest loan.',
      'Tell grandma what the final number was. Tell her what you did with it. Tell her grandpa paid off part of your debt. She will cry, and that is the point.',
    ],
  },
  {
    handle: 'IsThisFake',
    location: 'San Diego, CA',
    category: 'ethics',
    subject: 'Bought a Pikachu Illustrator on Facebook Marketplace',
    question: 'I bought what the seller said was a Pikachu Illustrator promo for $4,500 on Facebook Marketplace. I know, I know. It was listed as "authentic, ungraded." It looks right to me but I have seen screenshots of good fakes. How do I know?',
    answer: [
      'Let me be plain: you probably bought a counterfeit. A genuine Pikachu Illustrator — there are only 39 confirmed copies in the population — has never, in recorded hobby history, sold for $4,500. Even in the worst market conditions, the floor is in the mid-six figures. Anyone listing one on Facebook Marketplace at that price is telling you something, and the thing they are telling you is not good.',
      'Before you panic, get authentication. Overnight-mail the card to PSA or CGC for authentication-only service (PSA is $75 for authentication without grading, 40 business days). If PSA confirms fake, their authentication letter is evidence.',
      'While you wait: file a Facebook Marketplace report for counterfeit item immediately. Do not refund-request the seller directly first — that gives them time to delete the account. Facebook\'s policy on counterfeit collectibles is active enforcement, and the report triggers a hold. If you paid with PayPal Goods & Services, also file a PayPal claim within 180 days. If you paid via Venmo or Zelle personal transfer, you are nearly unprotected — but still file the Facebook report because the seller profile data helps the platform ban them even if it does not recover your money.',
      'Hard lesson. Big cards live at big auction houses or with verified-graded slabs. Facebook Marketplace is not the place for five-figure trading cards, and "authentic ungraded" on a card with a confirmed population of 39 is a sentence that should never be typed.',
      'I am sorry. You will not be the last.',
    ],
  },
  {
    handle: 'PortfolioKid22',
    location: 'Boston, MA',
    category: 'investing',
    subject: 'Should I put my Roth IRA money into cards?',
    question: 'I am 22, maxing my Roth at $7,000. My friend says I should pull out of index funds and put it in graded sports cards for better returns. He shows me screenshots of 10x plays. Is he wrong?',
    answer: [
      'He is wrong, and the screenshots are survivorship bias. For every 10x screenshot he shows you, there are 50 card investors with -60% five-year returns who are not posting screenshots. You are seeing the winners by design.',
      'The structural problems:',
      '(1) A Roth IRA cannot hold collectibles. The IRS classifies trading cards as "collectibles" under IRC §408(m), and Roth IRAs holding collectibles are deemed distributed, triggering tax plus a 10% early withdrawal penalty. Your friend either does not know this or is wrong about it. Either way, it is disqualifying.',
      '(2) Even in a taxable brokerage, card investing does not have the compounding, dividend reinvestment, or index-level diversification of a total-market ETF. VTI returns ~10% annualized over 30 years with near-zero effort. A card portfolio needs active management, authentication, storage cost, insurance cost, and sale friction, all of which eat into any price gain.',
      '(3) The "better returns" claim requires picking winners — which is the entire problem of card investing. A 1/8500 case-hit probability means most case-buyers lose, and you will not know if you are in the 1 or the 8499 until after the draw.',
      'What to do with the Roth: stay in index funds. A target-date fund or VTI/VXUS split is fine. At 22 with $7,000/year of contributions and a 45-year horizon, you will be at roughly $2.5-3.5 million at retirement. That is not a screenshot. It is math.',
      'If you want to enjoy cards as a hobby, allocate a separate, non-retirement budget — say, $100-300 a month — for cards you love. Keep that budget separate from your retirement. Never pull from retirement to fund it. If your friend keeps pushing, consider that your friend is running up his own card-portfolio comps by getting you to bid against him.',
    ],
  },
];

function isoWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickTwelve(seed: number): Letter[] {
  const pool = LETTERS.slice();
  const picks: Letter[] = [];
  let s = seed;
  for (let i = 0; i < 12 && pool.length > 0; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % pool.length;
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picks;
}

function weekLabel(weekOffset: number): { label: string; seed: number; range: string } {
  const now = new Date();
  now.setDate(now.getDate() - weekOffset * 7);
  const year = now.getFullYear();
  const week = isoWeekNumber(now);
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return {
    label: weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Last Week' : `${weekOffset} weeks ago`,
    seed: hashString(`${year}-W${week}`),
    range: `${fmt(monday)} – ${fmt(sunday)}, ${year}`,
  };
}

export default function MailbagClient() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const week = useMemo(() => weekLabel(weekOffset), [weekOffset]);
  const letters = useMemo(() => pickTwelve(week.seed), [week.seed]);

  const filtered = categoryFilter === 'all'
    ? letters
    : letters.filter((l) => l.category === categoryFilter);

  const featured = letters[0];

  const copyAnswer = async (l: Letter) => {
    const text = `Dear Auntie Mint — ${l.subject}\n\nFrom ${l.handle} (${l.location}):\n${l.question}\n\nAuntie Mint answers:\n${l.answer.join('\n\n')}\n\n— Via CardVault Mailbag · cardvault-two.vercel.app/mailbag`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            {week.label}
          </div>
          <div className="mt-0.5 text-sm text-slate-300">{week.range} · 12 letters</div>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((w) => (
            <button
              key={w}
              onClick={() => setWeekOffset(w)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                weekOffset === w
                  ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
                  : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500'
              }`}
            >
              {w === 0 ? 'This' : w === 1 ? '−1w' : `−${w}w`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            categoryFilter === 'all'
              ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
              : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500'
          }`}
        >
          All ({letters.length})
        </button>
        {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
          const meta = CATEGORY_META[c];
          const count = letters.filter((l) => l.category === c).length;
          if (count === 0) return null;
          return (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                categoryFilter === c
                  ? meta.activeClass
                  : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500'
              }`}
            >
              {meta.emoji} {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {categoryFilter === 'all' && featured && (
        <article className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/40 to-slate-950 p-5 shadow-lg shadow-amber-900/20">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-300">
              ⭐ Letter of the Week
            </span>
            <span className="text-slate-500">
              {CATEGORY_META[featured.category].emoji} {CATEGORY_META[featured.category].label}
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-amber-100">
            {featured.subject}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            From <span className="font-semibold text-slate-300">{featured.handle}</span> · {featured.location}
          </p>
          <blockquote className="mt-3 border-l-2 border-amber-700/50 pl-3 text-sm italic text-slate-300">
            {featured.question}
          </blockquote>
          <div className="mt-4 rounded-lg border border-amber-900/40 bg-amber-950/25 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-300">
              <span className="text-lg">👵</span> Auntie Mint says:
            </div>
            {featured.answer.map((p, i) => (
              <p key={i} className="mb-2 text-sm text-slate-200 last:mb-0">
                {p}
              </p>
            ))}
            <p className="mt-3 text-right text-xs italic text-amber-300/70">
              — Yours in cardboard, Auntie Mint
            </p>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => copyAnswer(featured)}
                className="rounded-lg border border-amber-700/50 bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-800/40"
              >
                📋 Copy
              </button>
            </div>
          </div>
        </article>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          {categoryFilter === 'all' ? 'More Letters' : `${CATEGORY_META[categoryFilter].label} Letters`}
        </h2>
        {(categoryFilter === 'all' ? filtered.slice(1) : filtered).map((l, idx) => {
          const realIdx = letters.indexOf(l);
          const isOpen = expanded[realIdx] ?? false;
          const meta = CATEGORY_META[l.category];
          return (
            <article
              key={`${l.handle}-${idx}`}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <button
                onClick={() => setExpanded((e) => ({ ...e, [realIdx]: !isOpen }))}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <span>{meta.emoji} {meta.label}</span>
                  </div>
                  <h3 className="mt-1 font-serif text-lg font-bold text-slate-100">
                    {l.subject}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    From {l.handle} · {l.location}
                  </p>
                  {!isOpen && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                      {l.question}
                    </p>
                  )}
                </div>
                <span className="mt-1 text-slate-500">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="mt-3 space-y-3">
                  <blockquote className="border-l-2 border-slate-700 pl-3 text-sm italic text-slate-300">
                    {l.question}
                  </blockquote>
                  <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-amber-300">
                      <span className="text-base">👵</span> Auntie Mint says:
                    </div>
                    {l.answer.map((p, i) => (
                      <p key={i} className="mb-2 text-sm text-slate-200 last:mb-0">
                        {p}
                      </p>
                    ))}
                    <p className="mt-2 text-right text-[11px] italic text-amber-300/70">
                      — Auntie Mint
                    </p>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => copyAnswer(l)}
                        className="rounded-md border border-amber-700/50 bg-amber-900/30 px-2 py-1 text-[11px] font-semibold text-amber-200 hover:bg-amber-800/40"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-5 text-center">
        <div className="text-2xl">✉️</div>
        <h3 className="mt-1 font-semibold text-slate-200">Send Auntie Mint a letter</h3>
        <p className="mt-1 text-sm text-slate-400">
          mailbag@cardvault.example (placeholder) · include a handle, your city/state, a category, and your question in under 150 words.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
            <span
              key={c}
              className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-400"
            >
              {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
