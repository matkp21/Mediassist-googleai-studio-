import { z } from 'zod';

export type UserRole = 'patient' | 'medico' | 'pro';

export interface ToolPermission {
  toolName: string;
  allowedRoles: UserRole[];
  description: string;
}

export const TOOL_PERMISSIONS: ToolPermission[] = [
  {
    toolName: 'fetchPatientRecord',
    allowedRoles: ['pro'],
    description: 'Fetches real patient records from the EHR system.',
  },
  {
    toolName: 'prescribeMedication',
    allowedRoles: ['pro'],
    description: 'Issues a prescription to a pharmacy.',
  },
  {
    toolName: 'queryMedicalGuidelines',
    allowedRoles: ['medico', 'pro'],
    description: 'Queries standard medical guidelines and textbooks.',
  },
  {
    toolName: 'simulateClinicalCase',
    allowedRoles: ['medico'],
    description: 'Starts a simulated clinical case for study purposes.',
  },
  {
    toolName: 'analyzeSymptoms',
    allowedRoles: ['patient', 'medico', 'pro'],
    description: 'Provides general information about symptoms (non-diagnostic).',
  }
];

export class ToolPermissionContext {
  private role: UserRole;

  constructor(role: UserRole) {
    this.role = role;
  }

  /**
   * Checks if the current role is allowed to execute the given tool.
   * @param toolName The name of the tool to check.
   * @returns boolean indicating if the tool is allowed.
   */
  public isToolAllowed(toolName: string): boolean {
    const permission = TOOL_PERMISSIONS.find(p => p.toolName === toolName);
    if (!permission) {
      // Default deny for unknown tools
      console.warn(`Tool ${toolName} not found in permissions registry. Denying access.`);
      return false;
    }
    return permission.allowedRoles.includes(this.role);
  }

  /**
   * Filters a list of tool definitions, returning only those allowed for the current role.
   * @param tools Array of tool definitions (e.g., from GenAI SDK).
   * @returns Filtered array of tools.
   */
  public filterAllowedTools<T extends { name: string }>(tools: T[]): T[] {
    return tools.filter(tool => this.isToolAllowed(tool.name));
  }
}
