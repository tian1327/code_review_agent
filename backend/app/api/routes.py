from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, Any
import logging

from ..models.schemas import (
    PRDataRequest, WorkflowResponse, WorkflowStatusResponse, 
    ErrorResponse, WorkflowStatus
)
from ..services.workflow_service import WorkflowService

router = APIRouter()
workflow_service = WorkflowService()
logger = logging.getLogger(__name__)


@router.post("/workflow/start", response_model=Dict[str, str])
async def start_workflow(request: PRDataRequest, background_tasks: BackgroundTasks):
    """
    Start a new code review workflow.
    
    This endpoint creates a new workflow and starts the execution in the background.
    Returns a workflow ID that can be used to poll for status updates.
    """
    try:
        # Create new workflow
        workflow_id = workflow_service.create_workflow(request)
        
        # Start workflow execution in background
        background_tasks.add_task(workflow_service.execute_workflow, workflow_id)
        
        logger.info(f"Started workflow {workflow_id}")
        
        return {
            "workflow_id": workflow_id,
            "message": "Workflow started successfully. Use the workflow_id to poll for status updates.",
            "status_endpoint": f"/api/workflow/{workflow_id}/status"
        }
        
    except Exception as e:
        logger.error(f"Failed to start workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start workflow: {str(e)}")


@router.get("/workflow/{workflow_id}/status", response_model=WorkflowStatusResponse)
async def get_workflow_status(workflow_id: str):
    """
    Get the current status of a workflow.
    
    This endpoint returns the current progress and status of the workflow.
    Use this for polling to track workflow progress.
    """
    try:
        status_data = workflow_service.get_workflow_status(workflow_id)
        
        if not status_data:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        return WorkflowStatusResponse(**status_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow status: {str(e)}")


@router.get("/workflow/{workflow_id}/result", response_model=WorkflowResponse)
async def get_workflow_result(workflow_id: str):
    """
    Get the complete result of a completed workflow.
    
    This endpoint returns the full workflow result including all step results.
    Only available for completed workflows.
    """
    try:
        workflow = workflow_service.get_workflow(workflow_id)
        
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        if workflow["status"] not in [WorkflowStatus.COMPLETED, WorkflowStatus.HUMAN_REVIEW_REQUIRED, WorkflowStatus.FAILED]:
            raise HTTPException(
                status_code=400, 
                detail=f"Workflow {workflow_id} is not completed yet. Current status: {workflow['status']}"
            )
        
        # Build the complete response
        from ..services.workflow_service import WorkflowService
        temp_service = WorkflowService()
        temp_service.active_workflows[workflow_id] = workflow
        
        result = temp_service._build_workflow_response(workflow_id, None)
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow result: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow result: {str(e)}")


@router.get("/workflow/{workflow_id}/steps")
async def get_workflow_steps(workflow_id: str):
    """
    Get detailed information about all steps in a workflow.
    
    This endpoint returns detailed information about each step including
    execution time, results, and any errors.
    """
    try:
        workflow = workflow_service.get_workflow(workflow_id)
        
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        return {
            "workflow_id": workflow_id,
            "steps": workflow["steps"],
            "total_steps": len(workflow["steps"]),
            "completed_steps": len([step for step in workflow["steps"] if step.status == WorkflowStatus.COMPLETED]),
            "failed_steps": len([step for step in workflow["steps"] if step.status == WorkflowStatus.FAILED])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow steps: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow steps: {str(e)}")


@router.delete("/workflow/{workflow_id}")
async def cancel_workflow(workflow_id: str):
    """
    Cancel a running workflow.
    
    This endpoint allows cancellation of workflows that are still running.
    """
    try:
        workflow = workflow_service.get_workflow(workflow_id)
        
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        if workflow["status"] not in [WorkflowStatus.PENDING, WorkflowStatus.RUNNING]:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot cancel workflow {workflow_id}. Current status: {workflow['status']}"
            )
        
        # In a real implementation, you would implement proper cancellation
        # For now, we'll just mark it as cancelled
        workflow_service.update_workflow_status(workflow_id, WorkflowStatus.FAILED)
        
        return {
            "workflow_id": workflow_id,
            "message": "Workflow cancelled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel workflow: {str(e)}")


@router.get("/workflows")
async def list_workflows():
    """
    List all active workflows.
    
    This endpoint returns a list of all workflows with their basic information.
    """
    try:
        workflows = []
        for workflow_id, workflow_data in workflow_service.active_workflows.items():
            workflows.append({
                "workflow_id": workflow_id,
                "status": workflow_data["status"],
                "created_at": workflow_data["created_at"],
                "updated_at": workflow_data["updated_at"],
                "human_review_required": workflow_data["human_review_required"]
            })
        
        return {
            "workflows": workflows,
            "total": len(workflows)
        }
        
    except Exception as e:
        logger.error(f"Failed to list workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list workflows: {str(e)}")


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns the health status of the API.
    """
    return {
        "status": "healthy",
        "service": "code-review-agent-api",
        "version": "1.0.0"
    } 