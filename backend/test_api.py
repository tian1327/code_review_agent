#!/usr/bin/env python3
"""
Test script for the Code Review Agent API.
"""

import requests
import time
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint."""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_start_workflow():
    """Test starting a workflow."""
    print("Testing workflow start...")
    
    # Sample workflow request based on your run_agents.sh
    workflow_request = {
        "input_file": "data/code_review_data/pydata__xarray-6992_problem_statement.txt",
        "repo_root": "PR_repos",
        "repo_path": "PR_repos/xarray",
        "module_path": "xarray",
        "hop": 1,
        "prefix": "hard",
        "skip_routing": False,
        "skip_architect": False,
        "skip_review": False,
        "update_deps_graph": False,
        "update_kd_graph": False,
        "verbose": True
    }
    
    response = requests.post(f"{BASE_URL}/api/workflow/start", json=workflow_request)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        workflow_id = result["workflow_id"]
        print(f"Workflow ID: {workflow_id}")
        print(f"Message: {result['message']}")
        return workflow_id
    else:
        print(f"Error: {response.text}")
        return None

def test_workflow_status(workflow_id):
    """Test getting workflow status."""
    print(f"Testing workflow status for {workflow_id}...")
    
    response = requests.get(f"{BASE_URL}/api/workflow/{workflow_id}/status")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Workflow Status: {result['status']}")
        print(f"Progress: {result['progress']}%")
        print(f"Message: {result['message']}")
        print(f"Current Step: {result.get('current_step', 'None')}")
        return result
    else:
        print(f"Error: {response.text}")
        return None

def test_workflow_result(workflow_id):
    """Test getting workflow result."""
    print(f"Testing workflow result for {workflow_id}...")
    
    response = requests.get(f"{BASE_URL}/api/workflow/{workflow_id}/result")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Workflow Status: {result['status']}")
        print(f"Total Execution Time: {result.get('total_execution_time', 'N/A')}")
        print(f"Human Review Required: {result['human_review_required']}")
        print(f"Number of Steps: {len(result['steps'])}")
        
        # Print step details
        for i, step in enumerate(result['steps'], 1):
            print(f"  Step {i}: {step['step']} - {step['status']}")
            if step.get('execution_time'):
                print(f"    Execution Time: {step['execution_time']:.2f}s")
            if step.get('error'):
                print(f"    Error: {step['error']}")
        
        return result
    else:
        print(f"Error: {response.text}")
        return None

def test_list_workflows():
    """Test listing all workflows."""
    print("Testing list workflows...")
    
    response = requests.get(f"{BASE_URL}/api/workflows")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Total Workflows: {result['total']}")
        for workflow in result['workflows']:
            print(f"  - {workflow['workflow_id']}: {workflow['status']}")
        return result
    else:
        print(f"Error: {response.text}")
        return None

def main():
    """Run all tests."""
    print("=== Code Review Agent API Test ===\n")
    
    # Test health
    test_health()
    
    # Test starting a workflow
    workflow_id = test_start_workflow()
    
    if workflow_id:
        print("Waiting for workflow to complete...")
        
        # Poll for status updates
        max_attempts = 30  # 30 seconds max
        for attempt in range(max_attempts):
            status_result = test_workflow_status(workflow_id)
            
            if status_result and status_result['status'] in ['completed', 'human_review_required', 'failed']:
                print(f"Workflow finished with status: {status_result['status']}")
                break
            
            time.sleep(1)
        
        # Get final result
        test_workflow_result(workflow_id)
    
    # Test listing workflows
    test_list_workflows()
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    main() 