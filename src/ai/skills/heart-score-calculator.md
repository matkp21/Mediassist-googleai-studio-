# heart-score-calculator
name: heart-score-calculator
description: Use when a patient presents with chest pain, acute coronary syndrome symptoms, or suspected myocardial infarction.
license: Proprietary
compatibility: MediAssistant MedGemma 27B

## HEART Score Evaluation Workflow

### Overview
Calculate the HEART score to assess the 6-week risk of major adverse cardiac events (MACE) in patients presenting with chest pain.

### Process Execution
1. Extract Variables: Query the patient record for History, ECG, Age, Risk factors, and Troponin levels.
2. Assign Values:
   * History: Highly suspicious (+2), Moderately suspicious (+1), Slightly suspicious (+0).
   * ECG: Significant ST depression (+2), Nonspecific repolarization disturbance (+1), Normal (+0).
   * Age: ≥ 65 years (+2), 45-64 years (+1), ≤ 45 years (+0).
   * Risk Factors: ≥ 3 risk factors or history of atherosclerotic disease (+2), 1-2 risk factors (+1), No risk factors (+0).
   * Troponin: ≥ 3× normal limit (+2), 1-3× normal limit (+1), ≤ normal limit (+0).
3. Calculate: Sum the variables.

### Verification
* Verify that the total score does not exceed 10.
* If any variable (e.g., ECG or Troponin) is missing, halt execution and request the data from the user. Do not proceed with assumptions.

### Anti-Patterns and Red Flags
* Do not assume normal Troponin if the lab result is older than 6 hours.
* Do not apply this score if the patient is experiencing an active ST-elevation myocardial infarction (STEMI); route immediately to emergency protocols.
