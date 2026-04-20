# Multi-Agent Orchestration (3-Tier Hierarchical Delegation)

To resolve the application crashing from triggering 25+ tools simultaneously, the AI architecture utilizes a Deep Hierarchical Supervision pattern. Rather than forcing a single agent to manage all capabilities, the system acts as an AI equivalent of a microservices architecture, breaking operations down into a strict 3-tier hierarchy. This ensures each model retains 100% of its attention budget for its specific task, avoiding context memory limits and tool hallucination. 

## Tier 1: Master Orchestrator (Intent Router)
The root supervisor agent that analyzes the user's raw input and routes the task to the appropriate mid-level Category Supervisor.

## Tier 2: Category Supervisors (5 Agents)
Middle-management agents that receive tasks from the Master Orchestrator, refine the context, and delegate to the exact leaf-node specialist.
- Knowledge & Community Supervisor
- Study & Revision Supervisor
- Assessment & Gamification Supervisor
- Clinical Skills Supervisor
- Professional Desk Supervisor

## Tier 3: Feature-Specific Sub-Agents (25+ Agents)
The specialized worker agents. Every single feature listed in the platform operates as its own isolated, independent sub-agent with its own dedicated prompt and narrow toolset.

These sub-agents follow the **Progressive Disclosure** pattern by keeping complex instructions, grading rubrics, and API tools isolated inside dedicated `skills/medico/` folders. They are only loaded into memory when their specific workflow is triggered.
