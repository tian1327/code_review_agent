export type WorkflowStep = 'routing' | 'architect' | 'review' | 'test_generation';

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'human_review_required';

export interface WorkflowStepResult {
  step: WorkflowStep;
  status: WorkflowStatus;
  result?: any;
  error?: string;
  execution_time?: number;
}

export interface WorkflowResponse {
  workflow_id: string;
  status: WorkflowStatus;
  steps: WorkflowStepResult[];
  final_result?: any;
  human_review_required: boolean;
  total_execution_time?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStatusResponse {
  workflow_id: string;
  status: WorkflowStatus;
  current_step?: WorkflowStep;
  progress: number;
  message: string;
  steps: WorkflowStepResult[];
}

export interface PRDataRequest {
  input_file: string;
  repo_root: string;
  repo_path: string;
  module_path: string;
  hop: number;
  prefix: string;
  skip_routing: boolean;
  skip_architect: boolean;
  skip_review: boolean;
  update_deps_graph: boolean;
  update_kd_graph: boolean;
  verbose: boolean;
}

export interface AgentOutput {
  routing?: {
    is_easy: boolean;
    reason: string;
    confidence?: number;
  };
  architect?: {
    architect_info: any;
    kd_graph: any;
    file_function_map: any;
  };
  review?: {
    overall_good: boolean;
    reasons: string[];
    issues: any[];
  };
  test_generation?: {
    new_test_cases: any[];
    coverage_improvement?: number;
  };
} 