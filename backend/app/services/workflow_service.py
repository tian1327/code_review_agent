import asyncio
import time
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import logging

from ..models.schemas import (
    WorkflowStep, WorkflowStatus, WorkflowStepResult, 
    WorkflowResponse, PRDataRequest
)


class WorkflowService:
    def __init__(self):
        self.active_workflows: Dict[str, Dict[str, Any]] = {}
        self.logger = logging.getLogger(__name__)

    def create_workflow(self, request: PRDataRequest) -> str:
        """Create a new workflow and return its ID."""
        workflow_id = str(uuid.uuid4())
        
        workflow_data = {
            "id": workflow_id,
            "request": request.dict(),
            "status": WorkflowStatus.PENDING,
            "steps": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "human_review_required": False,
            "final_result": None,
            "total_execution_time": None
        }
        
        self.active_workflows[workflow_id] = workflow_data
        self.logger.info(f"Created workflow {workflow_id}")
        return workflow_id

    def get_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow by ID."""
        return self.active_workflows.get(workflow_id)

    def update_workflow_status(self, workflow_id: str, status: WorkflowStatus, 
                             step_result: Optional[WorkflowStepResult] = None):
        """Update workflow status and optionally add a step result."""
        if workflow_id not in self.active_workflows:
            return
        
        workflow = self.active_workflows[workflow_id]
        workflow["status"] = status
        workflow["updated_at"] = datetime.utcnow().isoformat()
        
        if step_result:
            workflow["steps"].append(step_result)
        
        self.logger.info(f"Updated workflow {workflow_id} status to {status}")

    async def execute_workflow(self, workflow_id: str) -> WorkflowResponse:
        """Execute the complete workflow asynchronously."""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        start_time = time.time()
        self.update_workflow_status(workflow_id, WorkflowStatus.RUNNING)
        
        try:
            # Step 1: PR Routing Agent
            routing_result = await self._execute_routing_step(workflow_id, workflow["request"])
            
            if routing_result.status == WorkflowStatus.FAILED:
                return self._build_workflow_response(workflow_id, start_time)
            
            # If routing determines human review is needed, stop here
            if routing_result.result and not routing_result.result.get("is_easy", True):
                self.update_workflow_status(workflow_id, WorkflowStatus.HUMAN_REVIEW_REQUIRED, routing_result)
                workflow["human_review_required"] = True
                return self._build_workflow_response(workflow_id, start_time)
            
            # Step 2: PR Architect Agent
            architect_result = await self._execute_architect_step(workflow_id, workflow["request"])
            if architect_result.status == WorkflowStatus.FAILED:
                return self._build_workflow_response(workflow_id, start_time)
            
            # Step 3: PR Code Review Agent
            review_result = await self._execute_review_step(workflow_id, workflow["request"])
            if review_result.status == WorkflowStatus.FAILED:
                return self._build_workflow_response(workflow_id, start_time)
            
            # If review fails, human review is required
            if review_result.result and not review_result.result.get("overall_good", True):
                self.update_workflow_status(workflow_id, WorkflowStatus.HUMAN_REVIEW_REQUIRED, review_result)
                workflow["human_review_required"] = True
                return self._build_workflow_response(workflow_id, start_time)
            
            # Step 4: Test Generation Agent
            test_result = await self._execute_test_generation_step(workflow_id, workflow["request"])
            if test_result.status == WorkflowStatus.FAILED:
                return self._build_workflow_response(workflow_id, start_time)
            
            # Workflow completed successfully
            self.update_workflow_status(workflow_id, WorkflowStatus.COMPLETED)
            workflow["final_result"] = {
                "routing": routing_result.result,
                "architect": architect_result.result,
                "review": review_result.result,
                "test_generation": test_result.result
            }
            
            return self._build_workflow_response(workflow_id, start_time)
            
        except Exception as e:
            self.logger.error(f"Workflow {workflow_id} failed: {str(e)}")
            self.update_workflow_status(workflow_id, WorkflowStatus.FAILED)
            return self._build_workflow_response(workflow_id, start_time)

    async def _execute_routing_step(self, workflow_id: str, request: Dict[str, Any]) -> WorkflowStepResult:
        """Execute the PR routing agent step."""
        start_time = time.time()
        step_result = WorkflowStepResult(
            step=WorkflowStep.ROUTING,
            status=WorkflowStatus.RUNNING
        )
        
        try:
            # Simulate the routing agent execution
            # In the real implementation, this would call your existing routing agent
            await asyncio.sleep(2)  # Simulate processing time
            
            # Mock result - replace with actual routing agent call
            result = {
                "is_easy": True,
                "reason": "PR contains simple bug fixes and follows established patterns",
                "confidence": 0.85
            }
            
            step_result.status = WorkflowStatus.COMPLETED
            step_result.result = result
            step_result.execution_time = time.time() - start_time
            
        except Exception as e:
            step_result.status = WorkflowStatus.FAILED
            step_result.error = str(e)
            step_result.execution_time = time.time() - start_time
        
        self.update_workflow_status(workflow_id, WorkflowStatus.RUNNING, step_result)
        return step_result

    async def _execute_architect_step(self, workflow_id: str, request: Dict[str, Any]) -> WorkflowStepResult:
        """Execute the PR architect agent step."""
        start_time = time.time()
        step_result = WorkflowStepResult(
            step=WorkflowStep.ARCHITECT,
            status=WorkflowStatus.RUNNING
        )
        
        try:
            # Simulate the architect agent execution
            await asyncio.sleep(3)  # Simulate processing time
            
            # Mock result - replace with actual architect agent call
            result = {
                "architect_info": {
                    "files_affected": 3,
                    "complexity_score": 0.6,
                    "architectural_impact": "low"
                },
                "kd_graph": {
                    "nodes": 15,
                    "edges": 25,
                    "centrality_scores": {}
                },
                "file_function_map": {
                    "file1.py": ["function1", "function2"],
                    "file2.py": ["function3"]
                }
            }
            
            step_result.status = WorkflowStatus.COMPLETED
            step_result.result = result
            step_result.execution_time = time.time() - start_time
            
        except Exception as e:
            step_result.status = WorkflowStatus.FAILED
            step_result.error = str(e)
            step_result.execution_time = time.time() - start_time
        
        self.update_workflow_status(workflow_id, WorkflowStatus.RUNNING, step_result)
        return step_result

    async def _execute_review_step(self, workflow_id: str, request: Dict[str, Any]) -> WorkflowStepResult:
        """Execute the PR code review agent step."""
        start_time = time.time()
        step_result = WorkflowStepResult(
            step=WorkflowStep.REVIEW,
            status=WorkflowStatus.RUNNING
        )
        
        try:
            # Simulate the code review agent execution
            await asyncio.sleep(4)  # Simulate processing time
            
            # Mock result - replace with actual code review agent call
            result = {
                "overall_good": True,
                "reasons": [
                    "Code follows style guidelines",
                    "No security vulnerabilities detected",
                    "Proper error handling implemented"
                ],
                "issues": []
            }
            
            step_result.status = WorkflowStatus.COMPLETED
            step_result.result = result
            step_result.execution_time = time.time() - start_time
            
        except Exception as e:
            step_result.status = WorkflowStatus.FAILED
            step_result.error = str(e)
            step_result.execution_time = time.time() - start_time
        
        self.update_workflow_status(workflow_id, WorkflowStatus.RUNNING, step_result)
        return step_result

    async def _execute_test_generation_step(self, workflow_id: str, request: Dict[str, Any]) -> WorkflowStepResult:
        """Execute the test generation agent step."""
        start_time = time.time()
        step_result = WorkflowStepResult(
            step=WorkflowStep.TEST_GENERATION,
            status=WorkflowStatus.RUNNING
        )
        
        try:
            # Simulate the test generation agent execution
            await asyncio.sleep(5)  # Simulate processing time
            
            # Mock result - replace with actual test generation agent call
            result = {
                "new_test_cases": [
                    {
                        "test_name": "test_function1_edge_case",
                        "test_code": "def test_function1_edge_case():\n    # Test implementation",
                        "coverage_type": "edge_case"
                    },
                    {
                        "test_name": "test_function2_error_handling",
                        "test_code": "def test_function2_error_handling():\n    # Test implementation",
                        "coverage_type": "error_handling"
                    }
                ],
                "coverage_improvement": 0.15
            }
            
            step_result.status = WorkflowStatus.COMPLETED
            step_result.result = result
            step_result.execution_time = time.time() - start_time
            
        except Exception as e:
            step_result.status = WorkflowStatus.FAILED
            step_result.error = str(e)
            step_result.execution_time = time.time() - start_time
        
        self.update_workflow_status(workflow_id, WorkflowStatus.RUNNING, step_result)
        return step_result

    def _build_workflow_response(self, workflow_id: str, start_time: float) -> WorkflowResponse:
        """Build the final workflow response."""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        total_time = time.time() - start_time if start_time else None
        
        return WorkflowResponse(
            workflow_id=workflow_id,
            status=workflow["status"],
            steps=workflow["steps"],
            final_result=workflow["final_result"],
            human_review_required=workflow["human_review_required"],
            total_execution_time=total_time,
            created_at=workflow["created_at"],
            updated_at=workflow["updated_at"]
        )

    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get current workflow status for polling."""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            return None
        
        completed_steps = len([step for step in workflow["steps"] if step.status == WorkflowStatus.COMPLETED])
        total_steps = 4  # routing, architect, review, test_generation
        progress = (completed_steps / total_steps) * 100
        
        current_step = None
        if workflow["steps"]:
            current_step = workflow["steps"][-1].step
        
        return {
            "workflow_id": workflow_id,
            "status": workflow["status"],
            "current_step": current_step,
            "progress": progress,
            "message": f"Completed {completed_steps}/{total_steps} steps",
            "steps": workflow["steps"]
        } 