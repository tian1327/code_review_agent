from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class WorkflowStep(str, Enum):
    ROUTING = "routing"
    ARCHITECT = "architect"
    REVIEW = "review"
    TEST_GENERATION = "test_generation"


class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    HUMAN_REVIEW_REQUIRED = "human_review_required"


class PRDataRequest(BaseModel):
    input_file: str = Field(..., description="Path to the PR problem statement file")
    repo_root: str = Field(..., description="Root directory to the PR repository")
    repo_path: str = Field(..., description="Path to the PR repository")
    module_path: str = Field(..., description="Path to the Python module for pydeps consideration")
    hop: int = Field(default=1, description="How many hops away to search for relevant files")
    prefix: str = Field(default="hard", description="Prefix for log files")
    skip_routing: bool = Field(default=False, description="Skip routing agent")
    skip_architect: bool = Field(default=False, description="Skip architect agent")
    skip_review: bool = Field(default=False, description="Skip code review agent")
    update_deps_graph: bool = Field(default=False, description="Update the dependencies graph")
    update_kd_graph: bool = Field(default=False, description="Update the knowledge graph")
    verbose: bool = Field(default=True, description="Enable verbose output")


class RoutingResult(BaseModel):
    is_easy: bool
    reason: str
    confidence: Optional[float] = None


class ArchitectResult(BaseModel):
    architect_info: Dict[str, Any]
    kd_graph: Dict[str, Any]
    file_function_map: Dict[str, Any]


class ReviewResult(BaseModel):
    overall_good: bool
    reasons: List[str]
    issues: List[Dict[str, Any]] = []


class TestGenerationResult(BaseModel):
    new_test_cases: List[Dict[str, Any]]
    coverage_improvement: Optional[float] = None


class WorkflowStepResult(BaseModel):
    step: WorkflowStep
    status: WorkflowStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None


class WorkflowResponse(BaseModel):
    workflow_id: str
    status: WorkflowStatus
    steps: List[WorkflowStepResult]
    final_result: Optional[Dict[str, Any]] = None
    human_review_required: bool = False
    total_execution_time: Optional[float] = None
    created_at: str
    updated_at: str


class WorkflowStatusResponse(BaseModel):
    workflow_id: str
    status: WorkflowStatus
    current_step: Optional[WorkflowStep] = None
    progress: float = Field(..., ge=0, le=100)
    message: str
    steps: List[WorkflowStepResult]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    workflow_id: Optional[str] = None 