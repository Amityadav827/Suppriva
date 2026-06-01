import { PageType } from "@/lib/database/constants";
import type { JsonValue } from "@/lib/database/types";
import { getSeoRecordSafe, hasSchemaJson, serializeJsonLd } from "@/lib/seo/metadata";

export async function JsonLdScript({
  pageType,
  pageSlug,
  schema,
}: {
  pageType: PageType;
  pageSlug: string;
  schema?: JsonValue | JsonValue[];
}) {
  const seo = await getSeoRecordSafe(pageType, pageSlug);
  const schemas = [
    ...(Array.isArray(schema) ? schema : schema ? [schema] : []),
    ...(hasSchemaJson(seo) ? [seo.schema_json] : []),
  ];

  if (!schemas.length) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemas.length === 1 ? schemas[0] : schemas) }}
    />
  );
}
