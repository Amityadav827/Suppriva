import { SearchHero } from "@/components/search/SearchHero";
import { SearchPills } from "@/components/search/SearchPills";
import { SearchResults } from "@/components/search/SearchResults";
import { NewsletterSection } from "@/sections/NewsletterSection";
import type { SearchResult } from "@/lib/search-data";

export function SearchPageTemplate({
  query,
  results,
  suggestions,
  popular,
}: {
  query: string;
  results: SearchResult[];
  suggestions: string[];
  popular: string[];
}) {
  return (
    <main>
      <SearchHero initialQuery={query} />
      <SearchPills title="Search Suggestions" items={suggestions} />
      <SearchResults query={query} results={results} />
      <SearchPills title="Popular Searches" items={popular} />
      <SearchPills title="Recent Searches" items={suggestions.slice(0, 3)} variant="recent" />
      <NewsletterSection />
    </main>
  );
}
