export interface WorkflowRule {
  id?: string;
  name: string;
  contract_types: string[];
  jurisdictions: string[];
  conditions: {
    risk_score_threshold?: number;
    clause_types?: string[];
    contract_value_threshold?: number;
    requires_legal_review?: boolean;
    custom_conditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  actions: {
    route_to?: string[];
    escalate_to?: string[];
    notify?: string[];
    auto_approve?: boolean;
    require_approval_count?: number;
    compliance_checks?: string[];
  };
  priority: number;
  is_active: boolean;
}

export interface ComplianceCheck {
  id?: string;
  contract_id: string;
  check_type: 'playbook' | 'legal_requirement' | 'policy' | 'custom';
  check_name: string;
  status: 'passed' | 'failed' | 'warning' | 'pending' | 'skipped';
  details: {
    violations?: Array<{
      clause: string;
      issue: string;
      recommendation: string;
    }>;
    warnings?: string[];
    passed_checks?: string[];
    metadata?: any;
  };
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  auto_resolved: boolean;
  resolved_by?: string;
  checked_at?: string;
}

export interface WorkflowTask {
  id?: string;
  workflow_id: string;
  contract_id: string;
  assigned_to: string;
  task_type: 'review' | 'approve' | 'negotiate' | 'update' | 'sign' | 'archive';
  title: string;
  description?: string;
  due_date?: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'escalated' | 'cancelled';
  dependencies: string[];
  reminders_sent: number;
  completed_at?: string;
}

class WorkflowService {
  async evaluateWorkflowRules(contractData: {
    id: string;
    contract_type: string;
    jurisdiction: string;
    risk_score?: number;
    clause_types?: string[];
    value?: number;
  }): Promise<WorkflowRule[]> {
    console.warn('WorkflowService: Backend API integration pending');
    return [];
  }

  async createWorkflowRule(rule: WorkflowRule): Promise<{ success: boolean; id?: string; error?: string }> {
    console.warn('WorkflowService: Backend API integration pending');
    return { success: false, error: 'Backend API integration pending' };
  }

  async runComplianceChecks(contractId: string, contractData: {
    content: string;
    contract_type: string;
    jurisdiction: string;
    clauses?: any[];
  }): Promise<ComplianceCheck[]> {
    console.warn('WorkflowService: Backend API integration pending');
    return [];
  }

  async createTask(task: Omit<WorkflowTask, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    console.warn('WorkflowService: Backend API integration pending');
    return { success: false, error: 'Backend API integration pending' };
  }

  async getUserTasks(userId: string): Promise<WorkflowTask[]> {
    console.warn('WorkflowService: Backend API integration pending');
    return [];
  }

  async updateTaskStatus(
    taskId: string,
    status: WorkflowTask['status']
  ): Promise<{ success: boolean; error?: string }> {
    console.warn('WorkflowService: Backend API integration pending');
    return { success: false, error: 'Backend API integration pending' };
  }

  async checkTaskDependencies(taskId: string): Promise<boolean> {
    console.warn('WorkflowService: Backend API integration pending');
    return false;
  }
}

export const workflowService = new WorkflowService();
