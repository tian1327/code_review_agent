# Code Review Agent Backend

FastAPI backend for the Code Review Agent web application.

## Features

- **Workflow Management**: Start, monitor, and manage code review workflows
- **Real-time Status Updates**: Track progress of each workflow step
- **RESTful API**: Clean API endpoints for frontend integration
- **Background Processing**: Long-running workflows execute in background
- **Error Handling**: Comprehensive error handling and logging

## API Endpoints

### Workflow Management
- `POST /api/workflow/start` - Start a new code review workflow
- `GET /api/workflow/{workflow_id}/status` - Get workflow status
- `GET /api/workflow/{workflow_id}/result` - Get workflow results
- `GET /api/workflow/{workflow_id}/steps` - Get detailed step information
- `DELETE /api/workflow/{workflow_id}` - Cancel a workflow
- `GET /api/workflows` - List all workflows

### Health & Info
- `GET /` - API information
- `GET /api/health` - Health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the Server**
   ```bash
   # Option 1: Using the run script
   python run.py
   
   # Option 2: Using uvicorn directly
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Access the API**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/api/health

## Workflow Steps

The code review workflow consists of 4 main steps:

1. **PR Routing Agent** - Determines if PR is easy or requires human review
2. **PR Architect Agent** - Builds knowledge graph and analyzes architecture
3. **PR Code Review Agent** - Performs comprehensive code review
4. **Test Generation Agent** - Generates additional unit tests

## Usage Example

```python
import requests

# Start a workflow
response = requests.post("http://localhost:8000/api/workflow/start", json={
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
})

workflow_id = response.json()["workflow_id"]

# Poll for status
while True:
    status_response = requests.get(f"http://localhost:8000/api/workflow/{workflow_id}/status")
    status = status_response.json()
    
    print(f"Progress: {status['progress']}% - {status['message']}")
    
    if status['status'] in ['completed', 'human_review_required', 'failed']:
        break
    
    time.sleep(2)

# Get final results
result_response = requests.get(f"http://localhost:8000/api/workflow/{workflow_id}/result")
result = result_response.json()
print(f"Workflow completed: {result}")
```

## Development

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py        # API endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   └── workflow_service.py  # Workflow orchestration
│   └── utils/
│       ├── __init__.py
│       └── config.py        # Configuration
├── requirements.txt
├── run.py
└── README.md
```

### Adding New Features

1. **New API Endpoints**: Add to `app/api/routes.py`
2. **New Models**: Add to `app/models/schemas.py`
3. **New Services**: Add to `app/services/`
4. **Configuration**: Update `app/utils/config.py`

### Testing

```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=app
```

## Integration with Existing Code

The current implementation uses mock data for demonstration. To integrate with your existing agent code:

1. **Update Workflow Service**: Replace mock implementations in `workflow_service.py` with calls to your actual agent functions
2. **Import Your Modules**: Add your existing modules to the services
3. **Handle Dependencies**: Ensure all required dependencies are in `requirements.txt`
4. **Environment Variables**: Set up any required API keys or configuration

## Production Deployment

1. **Environment Variables**: Set up `.env` file with production settings
2. **CORS**: Update CORS settings for your frontend domain
3. **Logging**: Configure production logging
4. **Database**: Add persistent storage for workflows (currently in-memory)
5. **Authentication**: Add authentication/authorization if needed 