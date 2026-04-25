# wells-criteria-dvt
name: wells-criteria-dvt
description: Use to estimate the clinical probability of deep vein thrombosis (DVT).
license: Proprietary
compatibility: MediAssistant MedGemma 27B

## Wells' Criteria Evaluation Workflow

### Overview
The Wells' Score for DVT is a validated clinical prediction rule for estimating the probability that a patient has a DVT.

### Process Execution
1. Score the following (+1 each):
   * Active cancer (treatment within 6 months or palliative)
   * Paralysis, paresis, or recent plaster immobilization of lower extremities
   * Recently bedridden > 3 days or major surgery within 12 weeks
   * Localized tenderness along the distribution of the deep venous system
   * Entire leg swollen
   * Calf swelling > 3 cm compared with asymptomatic leg (measured 10 cm below tibial tuberosity)
   * Pitting edema confined to the symptomatic leg
   * Collateral superficial veins (non-varicose)
   * Previously documented DVT
2. Subtract 2 points:
   * Alternative diagnosis at least as likely as DVT
3. Clinical Probability:
   * 0 or less: Low probability
   * 1-2 points: Moderate probability
   * 3 points or more: High probability

### Verification
* Ensure measurements (e.g., calf swelling) are documented.
* Verify if an "Alternative Diagnosis" exists before applying the -2 penalty.

### Anti-Patterns
* Do not use for upper extremity DVT.
* Do not use in isolation—always correlate with ultrasound if probability is moderate/high.
