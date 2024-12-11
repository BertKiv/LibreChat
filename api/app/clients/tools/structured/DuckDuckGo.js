const { Tool } = require('@langchain/core/tools');
const axios = require('axios');

class DuckDuckGo extends Tool {
  constructor(fields = {}) {
    super(fields);
    this.name = 'duckduckgo_search';
    this.description = 'Search the web using DuckDuckGo';
  }

  async _call({ input }) {
    try {
      const response = await axios.get('https://api.duckduckgo.com/', {
        params: {
          q: input,
          format: 'json',
          no_html: 1,
          skip_disambig: 1
        }
      });

      const { data } = response;
      let results = [];

      // Add abstract if available
      if (data.AbstractText) {
        results.push({
          title: 'Abstract',
          link: data.AbstractURL,
          snippet: data.AbstractText
        });
      }

      // Add related topics
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        data.RelatedTopics.forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0],
              link: topic.FirstURL,
              snippet: topic.Text
            });
          }
        });
      }

      return JSON.stringify(results);
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      throw new Error(`Failed to search DuckDuckGo: ${error.message}`);
    }
  }
}

module.exports = DuckDuckGo;
