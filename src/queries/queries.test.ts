/* eslint-disable camelcase */
import { faker } from '@faker-js/faker';
import type { GuardrailResult } from '@openai/guardrails';
import { runGuardrails } from '@openai/guardrails';

import { generateResponse } from './queries.mjs';
import { client } from '../client/openaiclient.mjs';

jest.mock('../client/openaiclient.js', () => ({ client: { responses: { create: jest.fn() } } }));
jest.mock('@openai/guardrails', () => ({ runGuardrails: jest.fn() }));

const runGuardrailsMock = runGuardrails as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method
const createMock = client.responses.create as jest.Mock;

describe('query runner module', () => {
  describe('generateResponse', () => {
    it('reattempts the query if the hallucination tripwire is triggered', async () => {
      const outputText = faker.lorem.lines(3);
      createMock.mockResolvedValue({ output_text: outputText });
      const failingResult: GuardrailResult[] = [ { info: { guardrail_name: 'Hallucination Detection' }, tripwireTriggered: true } ];
      const passingResult: GuardrailResult[] = [ { info: { guardrail_name: 'Hallucination Detection' }, tripwireTriggered: false } ];
      runGuardrailsMock.mockResolvedValueOnce(failingResult);
      runGuardrailsMock.mockResolvedValueOnce(passingResult);
      const userInput = faker.lorem.lines(4);

      const response = await generateResponse(userInput);
      expect(createMock).toHaveBeenCalledTimes(2);
      expect(response).toEqual(outputText);
    });

    it('reattempts only once', async () => {
      const outputText = faker.lorem.lines(3);
      createMock.mockResolvedValue({ output_text: outputText });
      const failingResult: GuardrailResult[] = [ { info: { guardrail_name: 'Hallucination Detection' }, tripwireTriggered: true } ];
      const passingResult: GuardrailResult[] = [ { info: { guardrail_name: 'Hallucination Detection' }, tripwireTriggered: false } ];
      runGuardrailsMock.mockResolvedValueOnce(failingResult);
      runGuardrailsMock.mockResolvedValueOnce(failingResult);
      runGuardrailsMock.mockResolvedValueOnce(passingResult);
      const userInput = faker.lorem.lines(4);

      const response = await generateResponse(userInput);
      expect(createMock).toHaveBeenCalledTimes(2);
      expect(response).toEqual(outputText);
    });
  });
});
