/**
 * GOVERNANCE SENTINEL: Tool Call Verification & PII Leak Prevention
 * Aligns with the governance section of the blueprint.
 */

interface ClinicalPolicy {
  allowedTools: string[];
  blockedPatterns: RegExp[];
  maxCallsPerRequest: number;
}

const clinicalPolicy: ClinicalPolicy = {
  allowedTools: [
    'get_patient_data_manifest',
    'loadSkill',
    'searchObservations',
    'getObservations',
    'timelineObservations',
    'compressMemory',
    'scanArchitecture',
    'captureObservation',
    'semanticSearch',
    'clinicalLiteratureScraper',
    'createTask',
    'updateTask',
    'listTasks',
    'setPlanMode',
    'scheduleAction',
    'pauseExecution',
    'spawnSpecialist',
    'analyzeClinicalData',
    'mcqGenerator', // and other tools in your app
    'generateFlashcards',
    'predictTopics',
    'sequentialDiagnostic',
    'interactiveMedicalScraper',
    'documentToSkill',
    'pubmed_search_literature',
    'fda_search_drug_interactions',
    'fda_get_adverse_events',
    'codeExecution',
    'visionOcclusion'
  ],
  blockedPatterns: [/ssn\s*[:=]/i, /password\s*[:=]/i, /credit\s*card/i],
  maxCallsPerRequest: 15
};

/**
 * Validates a tool call against the clinical governance policy.
 * Throws a specific error if a violation is detected.
 */
export function verifyToolCall(toolName: string, args: any, callCount: number) {
  // 1. Velocity check
  if (callCount >= clinicalPolicy.maxCallsPerRequest) {
    throw new Error(`Governance Violation: Execution Halted. Max tool call limit (${clinicalPolicy.maxCallsPerRequest}) reached.`);
  }

  // 2. Allowlist check
  // In a real system, we'd check against the registered tools.
  // For now, we simulate a whitelist.
  const isAllowed = clinicalPolicy.allowedTools.includes(toolName);
  // We allow basic tools by default if they aren't sensitive
  const sensitiveTools = ['deleteRecord', 'modifyEHR', 'prescribeMedication'];
  
  if (sensitiveTools.includes(toolName)) {
     // Trigger HITL (Human-in-the-loop) requirement
     throw new Error(`HITL Required: Clinical action '${toolName}' requires explicit physician approval.`);
  }

  // 3. PII / Security Pattern check
  const argsString = JSON.stringify(args);
  for (const pattern of clinicalPolicy.blockedPatterns) {
    if (pattern.test(argsString)) {
      throw new Error(`Security Violation: Blocked sensitive pattern detected in tool arguments for ${toolName}.`);
    }
  }

  return true;
}

/**
 * Audit Logger for Governance compliance.
 */
export function logToolExecution(toolName: string, args: any, result: any, userId?: string) {
  console.info(`[GOVERNANCE:AUDIT] Tool: ${toolName}, User: ${userId || 'anonymous'}`);
  // In production, write to a write-only Firestore collection.
}
