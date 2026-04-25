import { useState, useCallback } from "react";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export function useWebSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    setIsSearching(true);
    setError(null);

    try {
      // Using DuckDuckGo API (no key required) or fallback to a simple search aggregator
      // For production, consider using: Google Custom Search, Bing Search API, or SerpAPI
      
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`,
        {
          headers: {
            "User-Agent": "ENOSX-AI-Assistant/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse DuckDuckGo results
      const results: SearchResult[] = [];
      
      // Add instant answer if available
      if (data.AbstractText) {
        results.push({
          title: data.AbstractTitle || "Direct Answer",
          url: data.AbstractURL || "",
          snippet: data.AbstractText,
        });
      }

      // Add related topics
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(" - ")[0] || "Result",
              url: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        });
      }

      // Fallback: if no results, try alternative search
      if (results.length === 0) {
        results.push({
          title: "Search Results",
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Search for "${query}" on Google to find relevant information.`,
        });
      }

      setIsSearching(false);
      return results;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Search failed";
      setError(errorMsg);
      setIsSearching(false);
      
      // Return a fallback result
      return [
        {
          title: "Search Results",
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Unable to fetch live results. Click to search "${query}" on Google.`,
        },
      ];
    }
  }, []);

  return { performSearch, isSearching, error };
}
