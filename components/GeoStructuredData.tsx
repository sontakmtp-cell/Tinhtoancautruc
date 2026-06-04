import type { JsonLdObject } from '../src/geo/seo';

type GeoStructuredDataProps = {
  schema?: JsonLdObject;
  schemas?: JsonLdObject[];
};

function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export default function GeoStructuredData({ schema, schemas }: GeoStructuredDataProps) {
  const jsonLd = schemas ?? (schema ? [schema] : []);

  if (jsonLd.length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd.length === 1 ? jsonLd[0] : jsonLd) }}
    />
  );
}
