// api/app/clients/tools/structured/DuckDuckGoSearch.js
const { z } = require('zod');
const { Tool } = require('@langchain/core/tools');
const { logger } = require('~/config');

class DuckDuckGoSearch extends Tool {
  constructor(fields = {}) {
    super(fields);
    this.name = 'duckduckgo_search';
    this.description =
      'A free search engine for finding information from the web. Useful for when you need to answer questions about current events or general information.';

    this.schema = z.object({
      query: z.string().min(1).describe('The search query string.'),
      max_results: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe('The maximum number of search results to return. Defaults to 100.'),
    });
  }

  static lc_name() {
    return 'DuckDuckGoSearch';
  }

  async _call(input) {
    const validationResult = this.schema.safeParse(input);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validationResult.error.issues)}`);
    }

    const { query, max_results = 5 } = validationResult.data;

    try {
      // Using DuckDuckGo's HTML API endpoint
      const response = await fetch(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LibreChat/1.0)',
            'Accept': 'text/html',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const html = await response.text();
      
      // Parse the HTML response to extract search results
      const results = [];
      const regex = /<a rel="nofollow" class="result__a" href="([^"]+)".*?>([^<]+)<\/a>.*?<a class="result__snippet".*?>([^<]+)<\/a>/gs;
      let match;
      let count = 0;

      while ((match = regex.exec(html)) !== null && count < max_results) {
        results.push({
          title: match[2].trim(),
          link: match[1],
          snippet: match[3].trim(),
        });
        count++;
      }

      return JSON.stringify({
        query,
        results,
      });
    } catch (error) {
      logger.error('DuckDuckGo search request failed', error);
      return `DuckDuckGo search request failed: ${error.message}`;
    }
  }
}

module.exports = DuckDuckGoSearch;
