const { Tool } = require('@langchain/core/tools');
const axios = require('axios');
const path = require('path');
const { Tools } = require('librechat-data-provider');

class FirecrackerInterpreter extends Tool {
  constructor(fields = {}) {
    super(fields);
    this.name = Tools.execute_code;
    this.description = 'Execute code in a secure Firecracker VM environment. Supports Python, JavaScript, and Bash.';
    this.apiUrl = process.env.FIRECRACKER_API_URL || 'http://localhost:6666';
  }

  async _call({ input, files = [], session_id }) {
    try {
      // Parse input to extract code and language
      const { code, language = 'python' } = typeof input === 'string' 
        ? { code: input } 
        : input;

      // Create session if not exists
      if (!session_id) {
        const sessionResponse = await axios.post(`${this.apiUrl}/api/v1/sessions`, {
          language,
          memory_limit: '256m',
          timeout: 30
        });
        session_id = sessionResponse.data.session_id;
      }

      // Upload files if any
      for (const file of files) {
        await axios.post(`${this.apiUrl}/api/v1/sessions/${session_id}/files`, {
          file_id: file.file_id,
          name: file.filename,
          content: file.content
        });
      }

      // Execute code
      const response = await axios.post(`${this.apiUrl}/api/v1/sessions/${session_id}/execute`, {
        code,
        language
      });

      // Format response to match Code Execution Server format
      const outputs = [];

      if (response.data.error) {
        outputs.push({
          type: 'error',
          content: `Error: ${response.data.error}\n${response.data.output || ''}`
        });
      } else {
        outputs.push({
          type: 'output',
          content: response.data.output
        });

        // Handle generated files if any
        if (response.data.files && response.data.files.length > 0) {
          for (const file of response.data.files) {
            outputs.push({
              type: 'file',
              file_id: file.id,
              name: file.name,
              path: `/api/files/code/download/${session_id}/${file.id}`
            });
          }
        }
      }

      return {
        type: Tools.execute_code,
        output: outputs,
        session_id
      };
    } catch (error) {
      console.error('Firecracker execution error:', error);
      return {
        type: Tools.execute_code,
        output: [{
          type: 'error',
          content: `Failed to execute code: ${error.message}`
        }]
      };
    }
  }

  static validateInput(input) {
    const code = typeof input === 'string' ? input : input.code;
    if (!code) {
      throw new Error('Code parameter is required');
    }
    
    const language = typeof input === 'string' ? 'python' : (input.language || 'python');
    if (!['python', 'javascript', 'bash'].includes(language)) {
      throw new Error('Unsupported language. Supported languages are: python, javascript, bash');
    }
  }
}

module.exports = FirecrackerInterpreter;
