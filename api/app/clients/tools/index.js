const availableTools = require('./manifest.json');

// Structured Tools
const DALLE3 = require('./structured/DALLE3');
const StructuredWolfram = require('./structured/Wolfram');
const StructuredACS = require('./structured/AzureAISearch');
const StructuredSD = require('./structured/StableDiffusion');
const GoogleSearchAPI = require('./structured/GoogleSearch');
const TraversaalSearch = require('./structured/TraversaalSearch');
const TavilySearchResults = require('./structured/TavilySearchResults');
const FirecrackerInterpreter = require('./structured/FirecrackerInterpreter');
const DuckDuckGo = require('./structured/DuckDuckGo');

const tools = {
  'execute_code': FirecrackerInterpreter,
  'duckduckgo_search': DuckDuckGo,
  'google': GoogleSearchAPI,
  'wolfram': StructuredWolfram,
  'stable-diffusion': StructuredSD,
  'azure-ai-search': StructuredACS,
  'traversaal_search': TraversaalSearch,
  'tavily_search_results': TavilySearchResults,
  'dalle3': DALLE3,
};

module.exports = {
  availableTools,
  tools,
  // Structured Tools for backward compatibility
  DALLE3,
  StructuredSD,
  StructuredACS,
  GoogleSearchAPI,
  TraversaalSearch,
  StructuredWolfram,
  TavilySearchResults,
  FirecrackerInterpreter,
  DuckDuckGo,
};
