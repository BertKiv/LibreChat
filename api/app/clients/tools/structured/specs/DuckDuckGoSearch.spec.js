// api/app/clients/tools/structured/specs/DuckDuckGoSearch.spec.js
const DuckDuckGoSearch = require('../DuckDuckGoSearch');

describe('DuckDuckGoSearch', () => {
  let search;

  beforeEach(() => {
    search = new DuckDuckGoSearch();
  });

  it('should initialize with correct name and description', () => {
    expect(search.name).toBe('duckduckgo_search');
    expect(search.description).toContain('free search engine');
  });

  it('should validate input correctly', async () => {
    await expect(search._call({ query: '' })).rejects.toThrow('Validation failed');
    await expect(search._call({ query: 'test', max_results: 0 })).rejects.toThrow('Validation failed');
    await expect(search._call({ query: 'test', max_results: 11 })).rejects.toThrow('Validation failed');
  });

  it('should return search results in correct format', async () => {
    const result = await search._call({ query: 'test query', max_results: 2 });
    const parsed = JSON.parse(result);
    
    expect(parsed).toHaveProperty('query', 'test query');
    expect(parsed).toHaveProperty('results');
    expect(Array.isArray(parsed.results)).toBe(true);
    expect(parsed.results.length).toBeLessThanOrEqual(2);
    
    if (parsed.results.length > 0) {
      expect(parsed.results[0]).toHaveProperty('title');
      expect(parsed.results[0]).toHaveProperty('link');
      expect(parsed.results[0]).toHaveProperty('snippet');
    }
  });
});
