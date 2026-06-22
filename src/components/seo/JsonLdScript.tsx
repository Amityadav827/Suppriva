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
  const runtimeSchemas = Array.isArray(schema) ? schema : schema ? [schema] : [];
  const seoSchemas = hasSchemaJson(seo)
    ? Array.isArray(seo.schema_json)
      ? seo.schema_json
      : [seo.schema_json]
    : [];
  const schemas = [...runtimeSchemas, ...seoSchemas];

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
