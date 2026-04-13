// JSON-LD structured data component for SEO
// Data is server-generated from trusted static content (not user input), safe for direct serialization
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
