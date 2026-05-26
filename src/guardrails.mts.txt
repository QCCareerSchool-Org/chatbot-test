import type { GuardrailResult } from '@openai/guardrails';
import { OpenAI } from 'openai';
import type { Metadata } from 'openai/resources';

import type { Student } from '../domain/student.js';
import { runPreflightGuardrails } from './guardrails.mjs';
import { instructions } from './instructions.mjs';

type WorkflowOutput = {
  status: 'blocked' | 'answered';
  guardrails: GuardrailResult[];
  responseId: string | null;
  response: string;
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let previousResponseId: string | null = null;

export const resetWorkflowHistory = (): void => {
  previousResponseId = null;
};

export const runWorkflow = async (
  question: string,
  student: Student,
  metadata: Metadata | null
): Promise<WorkflowOutput> => {
  const { hasTripwire, results } = await runPreflightGuardrails(question, client);

  if (hasTripwire) {
    return { status: 'blocked', guardrails: results, responseId: previousResponseId, response: '' };
  }

  const response = await client.responses.create({
    input: createInput(question, student),
    metadata,
    instructions,
    max_output_tokens: 2048,
    model: 'gpt-4.1-mini',
    previous_response_id: previousResponseId,
    store: true,
    temperature: 1,
    top_p: 1,
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.output_text) {
    throw new Error('Response output is empty');
  }

  previousResponseId = response.id;

  return {
    status: 'answered',
    guardrails: results,
    responseId: response.id,
    response: response.output_text,
  };
};

const createInput = (question: string, student: Student): OpenAI.Responses.ResponseInput => [
  { role: 'developer', content: JSON.stringify({ type: 'student context', data: student }, null, 2) },
  { role: 'user', content: question },
];
