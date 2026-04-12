'use client';

export default function CopyLinkButton({ url }: { url: string }) {
  return (
    <button
      onClick={() => {
        if (typeof navigator !== 'undefined') {
          navigator.clipboard.writeText(url).catch(() => {});
        }
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      Copy Link
    </button>
  );
}
