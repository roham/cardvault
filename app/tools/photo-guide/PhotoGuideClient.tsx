'use client';

import { useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════════════════════ */

type CardType = 'raw' | 'graded' | 'sealed' | 'lot' | 'patch';

interface ChecklistItem {
  id: string;
  label: string;
  tip: string;
}

const CARD_TYPES: { id: CardType; label: string; icon: string; description: string }[] = [
  { id: 'raw', label: 'Raw Single', icon: '🃏', description: 'Ungraded individual card' },
  { id: 'graded', label: 'Graded Slab', icon: '🏅', description: 'PSA, BGS, CGC, SGC slab' },
  { id: 'sealed', label: 'Sealed Product', icon: '📦', description: 'Packs, boxes, cases' },
  { id: 'lot', label: 'Card Lot', icon: '📚', description: 'Multiple cards sold together' },
  { id: 'patch', label: 'Thick Patch/Jersey', icon: '🧥', description: 'Memorabilia or relic cards' },
];

const CHECKLISTS: Record<CardType, ChecklistItem[]> = {
  raw: [
    { id: 'raw-front', label: 'Front of card', tip: 'Fill 80% of the frame. Center the card with even margins on all sides.' },
    { id: 'raw-back', label: 'Back of card', tip: 'Show the full back including all text and numbering. Buyers check for print defects here.' },
    { id: 'raw-corners', label: 'Close-up of corners', tip: 'Crop tight on each corner or show all four in one macro shot. This is where condition shows most.' },
    { id: 'raw-centering', label: 'Close-up of centering', tip: 'Show the border width on all four sides. Tilt slightly to catch the border edges clearly.' },
    { id: 'raw-edges', label: 'Edge shot (side view)', tip: 'Hold the card at a slight angle to show edge wear, chipping, or whitening.' },
    { id: 'raw-surface', label: 'Surface detail', tip: 'Angle lighting to reveal any scratches, print lines, or surface imperfections on foil/chrome cards.' },
  ],
  graded: [
    { id: 'graded-front', label: 'Front showing grade', tip: 'Capture the full slab with the grade clearly visible. Avoid glare on the plastic — angle slightly.' },
    { id: 'graded-back', label: 'Back showing cert number', tip: 'Cert number must be legible so buyers can verify authenticity on PSA/BGS lookup tools.' },
    { id: 'graded-angle', label: 'Angle showing thickness', tip: 'A 45-degree angle shot proves the slab is genuine and shows the card inside is not tampered with.' },
    { id: 'graded-label', label: 'Close-up of label', tip: 'Zoom in on the grading label. Show the cert number, grade, and any subgrades clearly.' },
  ],
  sealed: [
    { id: 'sealed-front', label: 'Front of product', tip: 'Show the full front with product name and branding clearly visible.' },
    { id: 'sealed-back', label: 'Back of product', tip: 'Include any product specs, card counts, or hit odds printed on the back.' },
    { id: 'sealed-upc', label: 'UPC code', tip: 'Buyers use UPC codes to verify the product is legitimate and matches the listing.' },
    { id: 'sealed-seal', label: 'Seal/shrink wrap condition', tip: 'Show the factory seal is intact. Any tears or re-sealing evidence drastically reduces value.' },
    { id: 'sealed-sides', label: 'Side views', tip: 'Show all sides to prove no tampering. Corner dents on boxes should be disclosed.' },
  ],
  lot: [
    { id: 'lot-overview', label: 'Full lot overview', tip: 'Lay out all cards in the lot so the full quantity is visible. Grid layout works best.' },
    { id: 'lot-highlights', label: 'Highlight/key cards', tip: 'Pull out the most valuable cards and photograph them individually to draw attention.' },
    { id: 'lot-count', label: 'Card count proof', tip: 'Stack cards next to a ruler or include the count written on a card in the photo.' },
    { id: 'lot-condition', label: 'Condition sample', tip: 'Show a representative sample of card conditions. Buyers want to know the average quality.' },
    { id: 'lot-backs', label: 'Back of key cards', tip: 'Show backs of the most valuable cards in the lot to prove condition.' },
  ],
  patch: [
    { id: 'patch-front', label: 'Front showing patch/swatch', tip: 'Fill the frame with the card. Make sure the patch colors and texture are visible.' },
    { id: 'patch-back', label: 'Back of card', tip: 'Show serial numbering if applicable. Buyers verify patch cards are numbered correctly.' },
    { id: 'patch-detail', label: 'Patch/swatch close-up', tip: 'Macro shot of the patch material. Show the texture, colors, and any visible team logos.' },
    { id: 'patch-thickness', label: 'Side view (thickness)', tip: 'Thick patch cards may not fit standard holders. Show thickness so buyers can prepare.' },
    { id: 'patch-auto', label: 'Autograph detail (if applicable)', tip: 'If the card has an auto, get a clear close-up. Smeared or faded autos affect value.' },
  ],
};

type LightingTier = 'budget' | 'mid' | 'pro';

interface LightingSetup {
  id: LightingTier;
  label: string;
  cost: string;
  equipment: string[];
  positioning: string[];
  mistakes: string[];
}

const LIGHTING_SETUPS: LightingSetup[] = [
  {
    id: 'budget',
    label: 'Budget',
    cost: '$0 — Natural Light',
    equipment: [
      'Window with indirect sunlight',
      'White printer paper (diffuser)',
      'Phone or camera on stable surface',
      'Black felt or plain dark fabric',
    ],
    positioning: [
      'Place card near a window, not in direct sunlight',
      'Use north-facing windows for most consistent light',
      'Shoot between 10am and 2pm for best results',
      'Hold white paper between window and card to soften shadows',
    ],
    mistakes: [
      'Shooting in direct sunlight creates harsh shadows and washes out colors',
      'Cloudy days actually produce the best diffused lighting',
      'Avoid shooting at night under warm indoor lights — yellow cast kills photos',
    ],
  },
  {
    id: 'mid',
    label: 'Mid-Range',
    cost: '$20-50 — Ring Light or Desk Lamp',
    equipment: [
      'LED ring light (10-12 inch) or adjustable desk lamp',
      'Phone holder or small tripod',
      'Black felt background',
      'White tissue paper for diffusion',
    ],
    positioning: [
      'Place ring light directly above the card, 12-18 inches away',
      'Or use two desk lamps at 45-degree angles from each side',
      'Set color temperature to 5000-5500K (daylight white)',
      'Use tissue paper over lamp to diffuse and soften shadows',
    ],
    mistakes: [
      'Ring light can create circular reflections on slabs — offset slightly',
      'Single lamp from one side creates harsh directional shadows',
      'Too close to the card blows out highlights on foil/chrome',
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    cost: '$50-100 — Light Box Setup',
    equipment: [
      'Foldable light box/tent (16x16 inch minimum)',
      'Built-in or external LED strips (daylight balanced)',
      'Phone tripod with overhead mount',
      'Multiple background options (black, white, gray)',
    ],
    positioning: [
      'Place card flat in center of light box',
      'Use built-in diffusion panels on all sides',
      'Mount camera directly overhead pointing straight down',
      'Adjust brightness to avoid overexposure on reflective cards',
    ],
    mistakes: [
      'Cheap light boxes with warm LEDs add yellow tint — check color temp',
      'Box too small for graded slabs — measure your largest item first',
      'Overhead-only lighting can still cause glare on slabs — add side diffusion',
    ],
  },
];

interface BackgroundOption {
  id: string;
  label: string;
  color: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

const BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'black',
    label: 'Black Felt',
    color: 'bg-gray-950 border-gray-700',
    pros: ['Absorbs light, prevents reflections', 'Creates professional, clean look', 'Hides dust and small imperfections', 'Best contrast for most card borders'],
    cons: ['Dark-bordered cards can blend into background', 'Can look too dark on some phone cameras', 'Needs lint rolling to stay clean'],
    bestFor: 'Chrome, refractors, and most modern cards',
  },
  {
    id: 'white',
    label: 'White Background',
    color: 'bg-white border-gray-300',
    pros: ['Great for dark-bordered cards', 'Clean, clinical look buyers trust', 'Easy to color-correct in post', 'eBay prefers white backgrounds'],
    cons: ['Can wash out light-colored cards', 'Shows every speck of dust', 'Reflective — can bounce light back onto card'],
    bestFor: 'Dark-bordered cards, vintage cards, and eBay listings',
  },
  {
    id: 'team',
    label: 'Team Colors',
    color: 'bg-gradient-to-br from-blue-900 to-red-900 border-blue-700',
    pros: ['Adds visual pop on social media', 'Creates themed aesthetic', 'Stands out in Instagram feeds', 'Shows personality and branding'],
    cons: ['Can look unprofessional for high-end cards', 'Color cast can affect card color accuracy', 'Not recommended for eBay or COMC'],
    bestFor: 'Instagram, TikTok, and personal collection showcases',
  },
  {
    id: 'gray',
    label: 'Neutral Gray',
    color: 'bg-gray-500 border-gray-400',
    pros: ['True neutral — no color cast', 'Works for both light and dark cards', 'Professional photography standard', 'Easy white balance reference'],
    cons: ['Can look boring without styling', 'Not as dramatic as black', 'Harder to find in felt/fabric'],
    bestFor: 'Accurate color representation and professional scans',
  },
];

type Platform = 'ebay' | 'comc' | 'social' | 'facebook';

interface PlatformReq {
  id: Platform;
  label: string;
  icon: string;
  resolution: string;
  photoLimit: string;
  tips: string[];
  rules: string[];
}

const PLATFORMS: PlatformReq[] = [
  {
    id: 'ebay',
    label: 'eBay',
    icon: '🛒',
    resolution: 'Minimum 500px, recommended 1600x1200px',
    photoLimit: 'Up to 12 photos free',
    tips: [
      'First photo is the thumbnail — make it the best front-facing shot',
      'Use all 12 photo slots for high-value cards',
      'White backgrounds help with eBay search visibility',
      'Include a photo of the cert number for graded cards',
      'Avoid watermarks — eBay may suppress watermarked listings',
    ],
    rules: [
      'No stock photos for used items — must be actual item photos',
      'No borders, text overlays, or promotional graphics',
      'Image must be of the actual item being sold',
      'No composite or collage images as the main photo',
    ],
  },
  {
    id: 'comc',
    label: 'COMC',
    icon: '📋',
    resolution: 'Front scan required, minimum 300 DPI',
    photoLimit: 'Front + back scans',
    tips: [
      'COMC scans cards for you if you ship to them',
      'If self-scanning, use a flatbed scanner at 300+ DPI',
      'Save as PNG for lossless quality',
      'Crop tightly to card edges with 2-3px border',
      'Include back scan — COMC displays both sides',
    ],
    rules: [
      'Scans preferred over photos for consistency',
      'Must accurately represent card condition',
      'Resolution must be high enough for zoom functionality',
      'Color accuracy matters — calibrate your scanner',
    ],
  },
  {
    id: 'social',
    label: 'Instagram / TikTok',
    icon: '📱',
    resolution: '1080x1080px (square) or 1080x1350px (portrait)',
    photoLimit: 'Up to 10 photos/carousel, 60s video',
    tips: [
      'Square crop (1:1) works best for Instagram grid',
      'Portrait mode (4:5) gets more screen real estate in feed',
      'Use natural light for the most engaging color',
      'Show the card in hand for scale and authenticity',
      'Slow-motion video of refractors and holo cards performs well',
    ],
    rules: [
      'No resolution requirements, but higher is always better',
      'Hashtag with player name, card year, set, and #sportscards',
      'Tag the grading company for potential repost',
      'Stories and Reels get more reach than static posts',
    ],
  },
  {
    id: 'facebook',
    label: 'Facebook Marketplace',
    icon: '👥',
    resolution: 'Recommended 1200x1200px minimum',
    photoLimit: 'Up to 10 photos',
    tips: [
      'First photo is the hero image — it appears in search results',
      'Buyers scroll fast — make the first photo count',
      'Include a photo with a penny or coin for scale reference',
      'Show the card in a top loader or holder it will ship in',
      'Group photos work well for lots — show the spread',
    ],
    rules: [
      'Must be actual photos of the item',
      'No screenshots of other listings',
      'Price must match the listing — no bait and switch',
      'Respond to photo requests quickly to close sales',
    ],
  },
];

type Severity = 'Minor' | 'Major' | 'Deal-Breaker';

interface MistakeItem {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  fix: string;
}

const MISTAKES: MistakeItem[] = [
  {
    id: 'glare',
    title: 'Glare / Reflection on Slabs',
    description: 'A bright white spot or streak across the slab surface, usually from overhead lighting or flash. Obscures the card and grade label.',
    severity: 'Deal-Breaker',
    fix: 'Angle the slab 5-10 degrees and use diffused side lighting. Never use direct flash. A polarizing filter on your phone camera also helps eliminate reflections.',
  },
  {
    id: 'finger',
    title: 'Finger Visible in Photo',
    description: 'Your finger or thumb is visible holding the card or slab edge. Looks unprofessional and can obscure card details.',
    severity: 'Major',
    fix: 'Use a phone tripod or prop the card against a small stand. For raw cards, use a card stand or lean against a top loader. If holding is necessary, grip from the very bottom edge only.',
  },
  {
    id: 'white-balance',
    title: 'Wrong White Balance (Yellow Tint)',
    description: 'Indoor tungsten or warm LED lighting gives the photo a yellow/orange cast. Makes white borders look cream and colors look inaccurate.',
    severity: 'Major',
    fix: 'Set your camera white balance to "daylight" or "auto." Use 5000-5500K color temperature bulbs. Edit photos afterward — most phone editors have a white balance slider.',
  },
  {
    id: 'too-far',
    title: 'Card Too Small in Frame',
    description: 'The card occupies less than 50% of the photo. Buyers cannot see details, corners, or condition without zooming in.',
    severity: 'Major',
    fix: 'Fill at least 70-80% of the frame with the card. Get closer or use your phone\'s crop tool after shooting. Avoid digital zoom — it reduces quality.',
  },
  {
    id: 'dirty-bg',
    title: 'Dirty or Cluttered Background',
    description: 'Random objects, messy desk, carpet, or bedsheets visible behind the card. Distracts from the card and looks unprofessional.',
    severity: 'Minor',
    fix: 'Use a dedicated black felt or white backdrop. A single sheet of construction paper works in a pinch. Remove everything from the frame except the card.',
  },
  {
    id: 'blur',
    title: 'Out of Focus / Motion Blur',
    description: 'Card details are soft or blurry, usually from shaky hands or the camera focusing on the background instead of the card.',
    severity: 'Deal-Breaker',
    fix: 'Tap the card on your phone screen to lock focus. Use a tripod or rest your phone on a stable surface. Enable HDR mode for sharper results. Good lighting reduces the need for long exposures.',
  },
];

const PRO_TIPS = [
  {
    title: 'Shoot in RAW or highest quality JPEG',
    text: 'Most phones default to compressed JPEG. Switch to "High Efficiency" off or shoot in ProRAW/RAW for maximum detail. You can always compress later, but you can\'t add detail back.',
  },
  {
    title: 'Clean your phone lens before every session',
    text: 'Fingerprints and pocket lint on your phone camera lens cause haze and softness that no editing can fix. A quick wipe with a microfiber cloth takes 2 seconds and dramatically improves sharpness.',
  },
  {
    title: 'Batch your photography sessions',
    text: 'Set up your lighting and background once, then photograph all your cards in one session. Consistent lighting across all photos makes your listings look professional and saves time.',
  },
  {
    title: 'Use the 2-second timer for zero shake',
    text: 'Even pressing the shutter button causes micro-shake. Set a 2-second delay timer so the phone is completely still when the photo is captured. This is especially important for close-up detail shots.',
  },
  {
    title: 'Edit consistently — brightness, not filters',
    text: 'Slight adjustments to brightness and contrast are fine, but avoid Instagram-style filters. Buyers want to see accurate colors and condition. Over-edited photos erode trust and increase return rates.',
  },
  {
    title: 'Save originals and resize for each platform',
    text: 'Keep your full-resolution originals and create platform-specific copies. eBay needs landscape orientation, Instagram needs square crops, and COMC needs high-DPI scans. One shoot, multiple formats.',
  },
];

/* ═══════════════════════════════════════════════════════════════
   Helper Components
   ═══════════════════════════════════════════════════════════════ */

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    'Minor': 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
    'Major': 'bg-orange-900/40 text-orange-400 border-orange-700/50',
    'Deal-Breaker': 'bg-red-900/40 text-red-400 border-red-700/50',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[severity]}`}>
      {severity}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Lighting Diagram (CSS/SVG)
   ═══════════════════════════════════════════════════════════════ */

function LightingDiagram({ tier }: { tier: LightingTier }) {
  return (
    <div className="bg-gray-900 border border-gray-700/50 rounded-xl p-4 sm:p-6">
      <p className="text-xs text-gray-500 mb-3 text-center">Optimal Setup — Top-Down View</p>
      <svg viewBox="0 0 240 180" className="w-full max-w-xs mx-auto" aria-label={`Lighting diagram for ${tier} setup`}>
        {/* Background */}
        <rect x="0" y="0" width="240" height="180" fill="none" />

        {/* Card in center */}
        <rect x="95" y="65" width="50" height="50" rx="4" fill="#1f2937" stroke="#6ee7b7" strokeWidth="2" />
        <text x="120" y="94" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="600">CARD</text>

        {tier === 'budget' && (
          <>
            {/* Window on top */}
            <rect x="60" y="5" width="120" height="16" rx="3" fill="#374151" stroke="#9ca3af" strokeWidth="1" />
            <text x="120" y="16" textAnchor="middle" fill="#9ca3af" fontSize="8">WINDOW</text>
            {/* Light rays */}
            <line x1="90" y1="21" x2="105" y2="65" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
            <line x1="120" y1="21" x2="120" y2="65" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
            <line x1="150" y1="21" x2="135" y2="65" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
            {/* Diffuser paper */}
            <rect x="75" y="36" width="90" height="8" rx="2" fill="#f9fafb" opacity="0.15" stroke="#d1d5db" strokeWidth="0.5" />
            <text x="120" y="42" textAnchor="middle" fill="#9ca3af" fontSize="6">PAPER DIFFUSER</text>
            {/* Camera below */}
            <circle cx="120" cy="155" r="10" fill="#374151" stroke="#9ca3af" strokeWidth="1" />
            <text x="120" y="158" textAnchor="middle" fill="#9ca3af" fontSize="7">CAM</text>
            <line x1="120" y1="145" x2="120" y2="115" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,2" />
          </>
        )}

        {tier === 'mid' && (
          <>
            {/* Two lamps at 45 degree angles */}
            <ellipse cx="30" cy="40" rx="18" ry="10" fill="#374151" stroke="#fbbf24" strokeWidth="1" />
            <text x="30" y="43" textAnchor="middle" fill="#fbbf24" fontSize="7">LAMP</text>
            <line x1="48" y1="45" x2="95" y2="75" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
            <line x1="44" y1="50" x2="95" y2="85" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />

            <ellipse cx="210" cy="40" rx="18" ry="10" fill="#374151" stroke="#fbbf24" strokeWidth="1" />
            <text x="210" y="43" textAnchor="middle" fill="#fbbf24" fontSize="7">LAMP</text>
            <line x1="192" y1="45" x2="145" y2="75" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
            <line x1="196" y1="50" x2="145" y2="85" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />

            {/* 45 degree labels */}
            <text x="55" y="30" fill="#6b7280" fontSize="7">45°</text>
            <text x="178" y="30" fill="#6b7280" fontSize="7">45°</text>

            {/* Camera below */}
            <circle cx="120" cy="155" r="10" fill="#374151" stroke="#9ca3af" strokeWidth="1" />
            <text x="120" y="158" textAnchor="middle" fill="#9ca3af" fontSize="7">CAM</text>
            <line x1="120" y1="145" x2="120" y2="115" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,2" />
          </>
        )}

        {tier === 'pro' && (
          <>
            {/* Light box outline */}
            <rect x="50" y="25" width="140" height="120" rx="6" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="6,3" />
            <text x="120" y="20" textAnchor="middle" fill="#6b7280" fontSize="7">LIGHT BOX</text>

            {/* Diffusion panels on sides */}
            <rect x="50" y="25" width="6" height="120" rx="2" fill="#fbbf24" opacity="0.15" />
            <rect x="184" y="25" width="6" height="120" rx="2" fill="#fbbf24" opacity="0.15" />
            <rect x="50" y="25" width="140" height="6" rx="2" fill="#fbbf24" opacity="0.15" />

            {/* Light rays from all sides */}
            <line x1="56" y1="60" x2="95" y2="75" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
            <line x1="56" y1="90" x2="95" y2="90" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
            <line x1="184" y1="60" x2="145" y2="75" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
            <line x1="184" y1="90" x2="145" y2="90" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
            <line x1="100" y1="31" x2="108" y2="65" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
            <line x1="140" y1="31" x2="132" y2="65" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />

            {/* Overhead camera */}
            <circle cx="120" cy="155" r="10" fill="#374151" stroke="#9ca3af" strokeWidth="1" />
            <text x="120" y="158" textAnchor="middle" fill="#9ca3af" fontSize="7">CAM</text>
            <line x1="120" y1="145" x2="120" y2="115" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,2" />
            <text x="120" y="170" textAnchor="middle" fill="#6b7280" fontSize="6">OVERHEAD MOUNT</text>
          </>
        )}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export default function PhotoGuideClient() {
  const [cardType, setCardType] = useState<CardType>('raw');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [lightingTier, setLightingTier] = useState<LightingTier>('budget');
  const [activePlatform, setActivePlatform] = useState<Platform>('ebay');
  const [selectedBg, setSelectedBg] = useState('black');

  const currentChecklist = CHECKLISTS[cardType];
  const completedCount = currentChecklist.filter(item => checkedItems.has(item.id)).length;
  const totalCount = currentChecklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleCheck = useCallback((id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCardTypeChange = useCallback((type: CardType) => {
    setCardType(type);
    setCheckedItems(new Set());
  }, []);

  const currentSetup = LIGHTING_SETUPS.find(s => s.id === lightingTier)!;
  const currentPlatform = PLATFORMS.find(p => p.id === activePlatform)!;

  return (
    <div className="space-y-12">

      {/* ───── 1. Card Type Selector ───── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-1">What Are You Photographing?</h2>
        <p className="text-gray-400 text-sm mb-4">Select your card type for tailored photography recommendations.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CARD_TYPES.map(ct => (
            <button
              key={ct.id}
              onClick={() => handleCardTypeChange(ct.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                cardType === ct.id
                  ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
              }`}
            >
              <span className="text-2xl">{ct.icon}</span>
              <span className="text-sm font-medium">{ct.label}</span>
              <span className="text-xs text-gray-500 leading-tight">{ct.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ───── 2. Lighting Setup Guide ───── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-1">Lighting Setup Guide</h2>
        <p className="text-gray-400 text-sm mb-4">Choose your budget level to see the recommended lighting configuration.</p>

        <div className="flex gap-2 mb-6">
          {LIGHTING_SETUPS.map(s => (
            <button
              key={s.id}
              onClick={() => setLightingTier(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                lightingTier === s.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 border border-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <h3 className="text-lg font-semibold text-white">{currentSetup.label} Setup</h3>
            <span className="text-emerald-400 text-sm font-medium">{currentSetup.cost}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              {/* Equipment */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Equipment Needed</h4>
                <ul className="space-y-1.5">
                  {currentSetup.equipment.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-emerald-500 shrink-0 mt-0.5">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Positioning */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Positioning Tips</h4>
                <ul className="space-y-1.5">
                  {currentSetup.positioning.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-blue-400 shrink-0 mt-0.5">&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Common Mistakes</h4>
                <ul className="space-y-1.5">
                  {currentSetup.mistakes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-red-400 shrink-0 mt-0.5">&#10007;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SVG Diagram */}
            <LightingDiagram tier={lightingTier} />
          </div>
        </div>
      </section>

      {/* ───── 3. Photo Checklist ───── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Photo Checklist</h2>
            <p className="text-gray-400 text-sm">
              Track which photos you&apos;ve planned for your <span className="text-emerald-400 font-medium">{CARD_TYPES.find(c => c.id === cardType)?.label}</span>.
            </p>
          </div>
          <div className="text-sm text-gray-400">
            <span className="text-emerald-400 font-semibold">{completedCount}</span> of {totalCount} photos planned
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="space-y-3">
          {currentChecklist.map(item => {
            const isChecked = checkedItems.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-700/50'
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                  isChecked
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'border-gray-600'
                }`}>
                  {isChecked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isChecked ? 'text-emerald-400 line-through' : 'text-white'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.tip}</p>
                </div>
              </button>
            );
          })}
        </div>

        {completedCount === totalCount && totalCount > 0 && (
          <div className="mt-4 bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-4 text-center">
            <p className="text-emerald-400 font-semibold text-sm">All photos planned! You&apos;re ready to shoot.</p>
          </div>
        )}
      </section>

      {/* ───── 4. Background Selector ───── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-1">Background Selector</h2>
        <p className="text-gray-400 text-sm mb-4">Choose the right background for your card type and selling platform.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BACKGROUNDS.map(bg => (
            <button
              key={bg.id}
              onClick={() => setSelectedBg(bg.id)}
              className={`text-left p-5 rounded-xl border transition-all ${
                selectedBg === bg.id
                  ? 'bg-gray-800/80 border-emerald-600'
                  : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
              }`}
            >
              {/* Color swatch */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg border ${bg.color}`} />
                <div>
                  <p className="text-white font-semibold text-sm">{bg.label}</p>
                  <p className="text-xs text-emerald-400">{bg.bestFor}</p>
                </div>
              </div>

              {/* Pros */}
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-500 mb-1">Pros</p>
                <ul className="space-y-1">
                  {bg.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                      <span className="text-emerald-500 shrink-0">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Cons</p>
                <ul className="space-y-1">
                  {bg.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                      <span className="text-red-400 shrink-0">-</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ───── 5. Platform Requirements ───── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-1">Platform Requirements</h2>
        <p className="text-gray-400 text-sm mb-4">Each platform has different photo specs and best practices.</p>

        {/* Platform tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activePlatform === p.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 border border-gray-700'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>{currentPlatform.icon}</span>
              {currentPlatform.label}
            </h3>
            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-xs text-gray-500">Resolution: <span className="text-gray-300">{currentPlatform.resolution}</span></span>
              <span className="text-xs text-gray-500">Photos: <span className="text-gray-300">{currentPlatform.photoLimit}</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Tips</h4>
              <ul className="space-y-2">
                {currentPlatform.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-emerald-500 shrink-0 mt-0.5">&#10003;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Rules</h4>
              <ul className="space-y-2">
                {currentPlatform.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-amber-400 shrink-0 mt-0.5">&#9888;</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───── 6. Common Mistakes Gallery ───── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-1">Common Mistakes to Avoid</h2>
        <p className="text-gray-400 text-sm mb-4">These mistakes cost sellers time, money, and buyer trust.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MISTAKES.map(m => (
            <div key={m.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-white font-semibold text-sm">{m.title}</h3>
                <SeverityBadge severity={m.severity} />
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">{m.description}</p>
              <div className="bg-gray-900/60 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium mb-1">How to Fix</p>
                <p className="text-xs text-gray-300 leading-relaxed">{m.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── 7. Pro Tips ───── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-1">Pro Tips</h2>
        <p className="text-gray-400 text-sm mb-4">Level up your card photography with these expert techniques.</p>

        <div className="space-y-4">
          {PRO_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-4 bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <div className="w-8 h-8 bg-emerald-950/60 border border-emerald-800/40 rounded-lg flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">{tip.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
