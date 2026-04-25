import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { requireClinicalCitationMiddleware } from './middleware/clinicalVerification';
import { createCircuitBreakerMiddleware } from './middleware/circuitBreaker';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
  config: {
    middleware: [
      requireClinicalCitationMiddleware(),
      createCircuitBreakerMiddleware({ failureThreshold: 3, recoveryTimeoutMs: 15000 })
    ]
  }
});
