import { generateResponse } from "./queries.js";
import { GuardrailResult } from "@openai/guardrails";
import { runGuardrails } from "@openai/guardrails";
import { client } from "../client/openaiclient.js";

jest.mock('../client/openaiclient.js', () => ({
  client: {
    responses: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@openai/guardrails', () => {
  return {
    // __esModule: true, // Crucial if 'bar' uses export/import syntax
    // ...jest.requireActual('bar'),
    runGuardrails: jest.fn(), // Converts foo into a trackable Jest mock
  };
});

describe('query runner', () => {

  describe('generateResponse', () => {

    it('reattempts if the hallucination tripwire is triggered', async () => {
      const failingResult: GuardrailResult[] = [{ info: {}, tripwireTriggered: true }];
      const passingResult: GuardrailResult[] = [{ info: {}, tripwireTriggered: true }];
      (runGuardrails as jest.Mock).mockResolvedValueOnce(failingResult);
      (runGuardrails as jest.Mock).mockResolvedValueOnce(passingResult);
      const userInput = 'osdfjlsdfjkdasfads';
      await generateResponse(userInput);
    });
  });
});
