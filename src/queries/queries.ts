import { client } from "../client/openaiclient.js";
import sampleStudentData from '../../sampledata.json' with { type: 'json' };
import { runGuardrails, type GuardrailBundle } from "@openai/guardrails";
import type { Student } from "./student.js";
import { Agent } from "@openai/agents";
import { z } from "zod";

const instructions = `You are the QC Career School Student Support Assistant.

Use the uploaded knowledge base as the primary source of truth.
Never claim to have access to student-specific account data unless it is provided by the application.
If required account-specific information is missing, explain where the student can find it.
If staff intervention is required, direct the student to the appropriate contact.
Do not invent policies, dates, or fees.
Keep responses warm, supportive, and concise.`;

const outputGuardrailsConfig: GuardrailBundle = {
  guardrails: [
  {
    name: "Hallucination Detection",
    config: {
      model: "gpt-4.1-mini",
      knowledge_source: "vs_6a0f10bd9c60819181d27ab29297f270",
      confidence_threshold: 0.7
    },
  },
  {
    "name": "URL Filter",
    "config": {
      "url_allow_list": ["example.com", "192.168.1.100", "https://api.service.com/v1"],
      "allowed_schemes": ["https"],"block_userinfo": true,
      "allow_subdomains": false,
    }
  },
  { 
    "name": "Contains PII",
    "config": { block: false, detect_encoded_pii: true, entities: ["CREDIT_CARD", "US_BANK_NUMBER", "US_PASSPORT", "US_SSN"] 
    } 
  }
]
}
const guardrailsConfig: GuardrailBundle = {
  guardrails: [
    { name: "NSFW Text", config: { model: "gpt-4.1-mini", confidence_threshold: 0.7 } },
    { name: "Jailbreak", config: { model: "gpt-4.1-mini", confidence_threshold: 0.7 } },
    { name: "Moderation", config: { categories: ["sexual/minors", "hate/threatening", "harassment/threatening", "self-harm/instructions", "violence/graphic", "illicit/violent"] } },
    { name: "Prompt Injection Detection", config: { model: "gpt-4.1-mini", confidence_threshold: 0.7 } },
    { name: "Contains PII", config: { entities: ["CREDIT_CARD", "US_BANK_NUMBER", "US_PASSPORT", "US_SSN"], block: false } },
  ]
};

function triggeredGuardrail(results: any[], name: string): boolean {
  return (results ?? []).some(
    (r) =>
      r?.tripwireTriggered === true &&
      r?.guardrail?.name === name
  );
}

export async function generateResponse(userInput: string): Promise<string> {
  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {

    const retryInstructions =
      attempt === 0
        ? instructions
        : `${instructions}
        IMPORTANT:
        Answer ONLY using the provided knowledge base.
        If the answer is not explicitly supported, say:
        "I couldn't verify that information from the official resources."

        Do not infer missing details.`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      instructions: retryInstructions,
      input: [
        {
          role: "system",
          content: `Student context: ${JSON.stringify(sampleStudentData, null, 2)}`
        },
        {
          role: "user",
          content: userInput
        }
      ]
    });

    const outputText = response.output_text ?? "";

    const outputGuardrails = await runGuardrails(
      outputText,
      outputGuardrailsConfig,
      { guardrailLlm: client },
      true
    );

    if (!hasTripwire(outputGuardrails)) {
      return outputText;
    }
    
    const hallucinated = triggeredGuardrail(
      outputGuardrails,
      "Hallucination Detection"
    );

    if (!hallucinated) {
      return 'Request failed';
    }

    console.log(`Hallucination detected. Retry attempt ${attempt + 1}`);
  }

  return `
I couldn't verify that information from the official QC Career School resources.
Please contact Student Support for confirmation.
`;
}

function hasTripwire(results: any[]): boolean {
    return (results ?? []).some((r) => r?.tripwireTriggered === true);
}

function getSafeText(results: any[], fallbackText: string): string {
  for (const r of results ?? []) {
    if (r?.info && ("checked_text" in r.info)) {
      return r.info.checked_text ?? fallbackText;
    }
  }
  const pii = (results ?? []).find((r) => r?.info && "anonymized_text" in r.info);
  return pii?.info?.anonymized_text ?? fallbackText;
}
function getCandidateSchools(payload: Student) {
  const schools = payload.enrollments.map(e => e.course.school);
  const unique = Array.from(
    new Map(schools.map(s => [s.schoolId, s])).values()
  );
  return unique;
}

function classifySchool(candidateSchools: string[], question: string) {
  const ClassifierSchema = z.object({ classification: z.enum(["logistical", "course", "assignments"]) });
  const classifier = new Agent({
    name: "Classifier",
    instructions: `You are an assistant that classifies student messages into one of three categories: 
  1. Navigational or logistical questions 
  2. Questions about course content 
  3. Requests for help completing assignments`,
    model: "gpt-5.5",
    outputType: ClassifierSchema,
    modelSettings: {
      reasoning: {
        effort: "low",
        summary: "auto"
      },
      store: true
    }
  });

}

const question = "Give me a link to QC Career School"

async function query(question: string) {
  const candidateSchools = getCandidateSchools(sampleStudentData);
  const inputGuardrails = await runGuardrails(
    question,
    guardrailsConfig,
    { guardrailLlm: client },
    true
  );

  if (hasTripwire(inputGuardrails)) {
    console.log("Blocked input:", inputGuardrails);
    return;
  }

  const safeInput = getSafeText(inputGuardrails, question);

  const finalAnswer = await generateResponse(safeInput);

  console.log("FINAL ANSWER:", finalAnswer);
}

query(question);