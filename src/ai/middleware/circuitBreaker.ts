import { Middleware, GenerateRequest, GenerateResponse } from 'genkit';

/**
 * Architectural Mapping: Traffic Control / Reliability.
 * Prevents cascading failures when Vertex AI or external APIs experience latency.
 * Falls back rapidly to ensure the Medico Dashboard UI remains responsive.
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeoutMs: number;
}

const circuitState = {
  state: 'CLOSED' as CircuitState,
  failureCount: 0,
  lastFailureTime: 0,
};

export function createCircuitBreakerMiddleware(config: CircuitBreakerConfig): Middleware {
  return async (req: GenerateRequest, next: (req: GenerateRequest) => Promise<GenerateResponse>) => {
    const now = Date.now();

    // 1. Check if the circuit is OPEN (Tripped)
    if (circuitState.state === 'OPEN') {
      if (now - circuitState.lastFailureTime > config.recoveryTimeoutMs) {
        // Attempt recovery
        circuitState.state = 'HALF_OPEN';
        console.info("[CircuitBreaker] Entering HALF_OPEN state - testing recovery...");
      } else {
        // Circuit is still open - fail fast
        throw new Error("AI Service temporarily degraded. Our specialist agents are currently overloaded. Please rely on saved Knowledge Hub notes or try again in a few seconds.");
      }
    }

    try {
      // 2. Execute the request
      const response = await next(req);

      // 3. Handle successful recovery
      if (circuitState.state === 'HALF_OPEN') {
        circuitState.state = 'CLOSED';
        circuitState.failureCount = 0;
        console.info("[CircuitBreaker] Circuit CLOSED - Service restored.");
      }
      return response;
    } catch (error) {
      // 4. Handle failure and trip the circuit
      circuitState.failureCount += 1;
      circuitState.lastFailureTime = Date.now();

      if (circuitState.state === 'HALF_OPEN' || circuitState.failureCount >= config.failureThreshold) {
        circuitState.state = 'OPEN';
        console.warn(`[CircuitBreaker] Circuit TRIPPED: state=OPEN, failureCount=${circuitState.failureCount}`);
      }
      throw error;
    }
  };
}
