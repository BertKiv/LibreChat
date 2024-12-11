const { expect } = require('chai');
const nock = require('nock');
const { Tools } = require('librechat-data-provider');
const FirecrackerInterpreter = require('../FirecrackerInterpreter');

describe('FirecrackerInterpreter', () => {
  let interpreter;
  const apiUrl = 'http://localhost:6666';
  const session_id = 'test-session-123';

  beforeEach(() => {
    interpreter = new FirecrackerInterpreter();
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should initialize with default values', () => {
    expect(interpreter.name).to.equal(Tools.execute_code);
    expect(interpreter.description).to.include('Execute code');
    expect(interpreter.apiUrl).to.equal(apiUrl);
  });

  it('should create new session and execute code', async () => {
    const mockSessionResponse = {
      session_id,
      status: 'created'
    };

    const mockExecuteResponse = {
      output: 'Hello, World!',
      files: []
    };

    nock(apiUrl)
      .post('/api/v1/sessions')
      .reply(200, mockSessionResponse);

    nock(apiUrl)
      .post(`/api/v1/sessions/${session_id}/execute`)
      .reply(200, mockExecuteResponse);

    const result = await interpreter._call({
      input: 'print("Hello, World!")'
    });

    expect(result.type).to.equal(Tools.execute_code);
    expect(result.session_id).to.equal(session_id);
    expect(result.output).to.have.lengthOf(1);
    expect(result.output[0].type).to.equal('output');
    expect(result.output[0].content).to.equal('Hello, World!');
  });

  it('should use existing session and execute code', async () => {
    const mockExecuteResponse = {
      output: 'Hello, World!',
      files: []
    };

    nock(apiUrl)
      .post(`/api/v1/sessions/${session_id}/execute`)
      .reply(200, mockExecuteResponse);

    const result = await interpreter._call({
      input: 'print("Hello, World!")',
      session_id
    });

    expect(result.type).to.equal(Tools.execute_code);
    expect(result.session_id).to.equal(session_id);
    expect(result.output).to.have.lengthOf(1);
    expect(result.output[0].type).to.equal('output');
    expect(result.output[0].content).to.equal('Hello, World!');
  });

  it('should handle execution errors', async () => {
    const mockSessionResponse = {
      session_id,
      status: 'created'
    };

    const mockError = {
      error: 'Syntax error',
      output: 'Error: invalid syntax'
    };

    nock(apiUrl)
      .post('/api/v1/sessions')
      .reply(200, mockSessionResponse);

    nock(apiUrl)
      .post(`/api/v1/sessions/${session_id}/execute`)
      .reply(200, mockError);

    const result = await interpreter._call({
      input: 'print("Hello, World!'  // Missing closing quote
    });

    expect(result.type).to.equal(Tools.execute_code);
    expect(result.output).to.have.lengthOf(1);
    expect(result.output[0].type).to.equal('error');
    expect(result.output[0].content).to.include('Syntax error');
  });

  it('should handle file outputs', async () => {
    const mockSessionResponse = {
      session_id,
      status: 'created'
    };

    const mockResponse = {
      output: 'Generated plot',
      files: [{
        id: 'file123',
        name: 'plot.png'
      }]
    };

    nock(apiUrl)
      .post('/api/v1/sessions')
      .reply(200, mockSessionResponse);

    nock(apiUrl)
      .post(`/api/v1/sessions/${session_id}/execute`)
      .reply(200, mockResponse);

    const result = await interpreter._call({
      input: 'plt.plot([1,2,3])'
    });

    expect(result.type).to.equal(Tools.execute_code);
    expect(result.output).to.have.lengthOf(2);
    expect(result.output[0].type).to.equal('output');
    expect(result.output[1].type).to.equal('file');
    expect(result.output[1].file_id).to.equal('file123');
    expect(result.output[1].path).to.include(session_id);
  });

  it('should handle file uploads', async () => {
    const mockSessionResponse = {
      session_id,
      status: 'created'
    };

    const mockExecuteResponse = {
      output: 'File processed',
      files: []
    };

    const testFile = {
      file_id: 'test123',
      filename: 'test.txt',
      content: 'Hello, World!'
    };

    nock(apiUrl)
      .post('/api/v1/sessions')
      .reply(200, mockSessionResponse);

    nock(apiUrl)
      .post(`/api/v1/sessions/${session_id}/files`)
      .reply(200, { status: 'uploaded' });

    nock(apiUrl)
      .post(`/api/v1/sessions/${session_id}/execute`)
      .reply(200, mockExecuteResponse);

    const result = await interpreter._call({
      input: 'process_file("test.txt")',
      files: [testFile]
    });

    expect(result.type).to.equal(Tools.execute_code);
    expect(result.session_id).to.equal(session_id);
    expect(result.output).to.have.lengthOf(1);
    expect(result.output[0].type).to.equal('output');
    expect(result.output[0].content).to.equal('File processed');
  });

  it('should validate input parameters', () => {
    expect(() => FirecrackerInterpreter.validateInput('print("test")'))
      .to.not.throw();

    expect(() => FirecrackerInterpreter.validateInput({ code: 'test' }))
      .to.not.throw();

    expect(() => FirecrackerInterpreter.validateInput({}))
      .to.throw('Code parameter is required');

    expect(() => FirecrackerInterpreter.validateInput({ code: 'test', language: 'invalid' }))
      .to.throw('Unsupported language');
  });
});
