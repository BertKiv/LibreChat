const availableTools = require('./manifest.json');

// Structured Tools
const StructuredWolfram = require('./structured/Wolfram');
const StructuredSD = require('./structured/StableDiffusion');
const DALLE3 = require('./structured/DALLE3');
const AzureAISearch = require('./structured/AzureAISearch');
const GoogleSearchAPI = require('./structured/GoogleSearch');
const TraversaalSearch = require('./structured/TraversaalSearch');
const TavilySearchResults = require('./structured/TavilySearchResults');

const tools = {
  'google': GoogleSearchAPI,
  'wolfram': StructuredWolfram,
  'stable-diffusion': StructuredSD,
  'azure-ai-search': AzureAISearch,
  'traversaal_search': TraversaalSearch,
  'dall-e-3': DALLE3,
  'tavily_search_results': TavilySearchResults,
};

module.exports = {
  availableTools,
  tools,
  StructuredSD,
  DALLE3,
  AzureAISearch,
  GoogleSearchAPI,
  TraversaalSearch,
  StructuredWolfram,
  TavilySearchResults,
};
