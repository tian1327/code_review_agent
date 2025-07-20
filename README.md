# LLM Agents for Automatic Code Review

A web application demonstrating multi-step LLM agent workflow for automatic code review, featuring a FastAPI backend and React frontend.

## 🏗️ Architecture

- **Backend**: FastAPI with async workflow execution
- **Frontend**: React with TypeScript and Material-UI
- **Workflow**: Multi-agent system with routing, architect, code review, and test generation agents

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### 1. Python (3.8+)
```bash
python3 --version
```

### 2. Node.js and npm
```bash
node --version
npm --version
```

If Node.js is not installed, install via Homebrew:
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/bin:$PATH"

# Install Node.js
brew install node
```

### 3. Git
```bash
git --version
```

## 🚀 Quick Start

### Step 1: Clone and Setup Project

```bash
# Navigate to your project directory
cd /Users/tianliu/Desktop/desktop/git/code_review_agent

# Verify you're in the correct directory
pwd
ls -la
```

### Step 2: Setup Backend (Python/FastAPI)

```bash
# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Verify virtual environment is active (should show venv path)
which python

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; print('FastAPI installed successfully')"
```

### Step 3: Setup Frontend (React/Node.js)

```bash
# Navigate to frontend directory
cd ../frontend

# Add Homebrew to PATH (if not already done)
export PATH="/opt/homebrew/bin:$PATH"

# Install frontend dependencies
npm install

# Verify installation
npm list --depth=0
```

## 🏃‍♂️ Running the Application

### Option 1: Run Both Services (Recommended)

**Terminal 1 - Backend:**
```bash
# Navigate to project root
cd /Users/tianliu/Desktop/desktop/git/code_review_agent

# Activate virtual environment
source venv/bin/activate

# Start backend server
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
# Navigate to project root
cd /Users/tianliu/Desktop/desktop/git/code_review_agent

# Add Homebrew to PATH
export PATH="/opt/homebrew/bin:$PATH"

# Start frontend server
cd frontend
npm start
```

### Option 2: Run Frontend Only (for UI demo)

If you only want to see the frontend interface without backend integration:

```bash
# Navigate to frontend directory
cd /Users/tianliu/Desktop/desktop/git/code_review_agent/frontend

# Add Homebrew to PATH
export PATH="/opt/homebrew/bin:$PATH"

# Start frontend server
npm start
```

## 🔍 Verification Commands

### Check if Services are Running

**Backend (Port 8000):**
```bash
# Check if backend is running
lsof -i :8000

# Test backend API
curl http://localhost:8000/health

# Expected response: {"status": "healthy"}
```

**Frontend (Port 3000):**
```bash
# Check if frontend is running
lsof -i :3000

# Test frontend
curl -s http://localhost:3000 | head -5

# Should return HTML content
```

### Check Virtual Environment

```bash
# Verify virtual environment is active
which python
# Should show: /Users/tianliu/Desktop/desktop/git/code_review_agent/venv/bin/python

# Check installed packages
pip list
```

### Check Node.js Installation

```bash
# Verify Node.js and npm
node --version
npm --version

# Check frontend dependencies
cd frontend
npm list --depth=0
```

## 🌐 Access the Application

Once both services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
code_review_agent/
├── README.md                 # This file
├── main.py                   # Original Python workflow
├── run_agents.sh            # Original bash script
├── venv/                    # Python virtual environment
├── backend/
│   ├── requirements.txt     # Python dependencies
│   ├── run.py              # FastAPI server
│   ├── app/
│   │   ├── main.py         # FastAPI app setup
│   │   ├── api/routes.py   # API endpoints
│   │   ├── models/schemas.py # Pydantic models
│   │   └── services/workflow_service.py # Business logic
│   └── test_api.py         # API testing script
└── frontend/
    ├── package.json         # Node.js dependencies
    ├── public/              # Static files
    ├── src/
    │   ├── App.tsx         # Main React component
    │   ├── index.tsx       # React entry point
    │   ├── types/workflow.ts # TypeScript types
    │   └── components/     # React components
    └── tsconfig.json       # TypeScript config
```

## 🛠️ Troubleshooting

### Common Issues

**1. "npm: command not found"**
```bash
# Add Homebrew to PATH
export PATH="/opt/homebrew/bin:$PATH"
# Add to ~/.zshrc for persistence
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**2. "Could not read package.json"**
```bash
# Make sure you're in the frontend directory
cd /Users/tianliu/Desktop/desktop/git/code_review_agent/frontend
pwd  # Should show: .../code_review_agent/frontend
ls package.json  # Should exist
```

**3. "Module not found" errors**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**4. "Port already in use"**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
```

**5. Virtual environment issues**
```bash
# Recreate virtual environment
cd /Users/tianliu/Desktop/desktop/git/code_review_agent
rm -rf venv
python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

### Environment Variables

Add these to your shell profile (`~/.zshrc` or `~/.bash_profile`):
```bash
# Add Homebrew to PATH
export PATH="/opt/homebrew/bin:$PATH"

# Python virtual environment (optional)
export PYTHONPATH="/Users/tianliu/Desktop/desktop/git/code_review_agent:$PYTHONPATH"
```

## 📚 API Endpoints

The backend provides the following endpoints:

- `GET /health` - Health check
- `POST /workflow/start` - Start a new workflow
- `GET /workflow/{workflow_id}/status` - Get workflow status
- `GET /workflow/{workflow_id}/results` - Get workflow results
- `GET /workflow/{workflow_id}/steps` - Get workflow steps
- `DELETE /workflow/{workflow_id}` - Cancel workflow

## 🎯 Features

### Frontend Features
- **Professional UI**: Material-UI components with modern styling
- **Workflow Progress**: Visual progress tracking with connected boxes
- **Three-Panel Layout**: Input tabs, image display, and agent outputs
- **Real-time Updates**: Dynamic workflow status updates
- **Responsive Design**: Works on desktop and mobile

### Backend Features
- **Async Workflow Execution**: Non-blocking workflow processing
- **RESTful API**: Clean API design with proper error handling
- **Background Tasks**: Long-running workflow execution
- **Status Tracking**: Real-time workflow progress monitoring
- **CORS Support**: Frontend-backend communication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Author**: Tian Liu  
**Project**: LLM Agents for Automatic Code Review  
**Last Updated**: July 2024
