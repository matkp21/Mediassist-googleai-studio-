import { Middleware, GenerateRequest, GenerateResponse } from 'genkit';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
 failureThreshold: number;
 recoveryTimeoutMs: number;
}

// In-memory state tracking for the provider circuit breaker mechanism 
// In a distributed environment, this state could be synchronized via Redis
const circuitState = {
 state: 'CLOSED' as CircuitState,
 failureCount: 0,
 lastFailureTime: 0,
};

/**
* Architectural Mapping: DeepTutor LLM Traffic Control and Circuit Breaker.
* Intercepts Genkit model calls to prevent cascading system failures and resource exhaustion.
*/
export function createCircuitBreakerMiddleware(config: CircuitBreakerConfig): Middleware {
 return async (req: GenerateRequest, next: (req: GenerateRequest) => Promise<GenerateResponse>) => {
   const now = Date.now();

   // Evaluate the current state of the circuit before allowing the outbound request
   if (circuitState.state === 'OPEN') {
     if (now - circuitState.lastFailureTime > config.recoveryTimeoutMs) {
       console.warn(` Recovery timeout expired. Transitioning to HALF_OPEN state.`);
       circuitState.state = 'HALF_OPEN';
     } else {
       // Fast-fail the request to protect downstream APIs and reduce latency for the end user
       throw new Error(" Circuit is OPEN. Fast-failing request due to external provider instability.");
     }
   }

   try {
     // Proceed with the actual LLM network execution
     const response = await next(req);

     // On a successful response, reset the breaker if it was testing recovery
     if (circuitState.state === 'HALF_OPEN') {
       console.info(` Request successful in HALF_OPEN state. Closing circuit.`);
       circuitState.state = 'CLOSED';
       circuitState.failureCount = 0;
     }

     return response;
   } catch (error) {
     // On network failure or API error, increment the tracking metrics
     circuitState.failureCount += 1;
     circuitState.lastFailureTime = Date.now();

     console.error(` LLM Request failed. Current failure count: ${circuitState.failureCount}`);

     // Trip the circuit if the threshold is breached or if a test request fails
     if (circuitState.state === 'HALF_OPEN' || circuitState.failureCount >= config.failureThreshold) {
       console.error(` Failure threshold reached. Tripping circuit to OPEN state.`);
       circuitState.state = 'OPEN';
     }

     throw error;
   }
 };
}
