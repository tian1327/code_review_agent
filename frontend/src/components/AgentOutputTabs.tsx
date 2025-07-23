import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Chip,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Route as RouteIcon, 
  Architecture as ArchitectureIcon,
  RateReview as ReviewIcon,
  Science as TestIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import { WorkflowStep, WorkflowStatus } from '../types/workflow';

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  height: '500px',
  overflow: 'auto',
}));

const OutputContent = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
}));

const stepConfig = [
  {
    step: 'routing' as WorkflowStep,
    label: 'PR Routing',
    icon: <RouteIcon />, 
    steps: [
      'Reviewing problem statement and patch file',
      'Analyzing PR complexity and impact',
      'Making routing decisions',
    ],
  },
  {
    step: 'architect' as WorkflowStep,
    label: 'Architect Analysis',
    icon: <ArchitectureIcon />, 
    steps: [
      'Summarizing problem statement and patch file',
      'Parsing code base and building knowledge graph',
      'Retrieving relevant code snippets',
      'Generating review plan for each relevant code snippet',
    ],
  },
  {
    step: 'review' as WorkflowStep,
    label: 'Code Review',
    icon: <ReviewIcon />, 
    steps: [
      'Checking code change in patch file for correctness, quality, and impact',
      'Analyzing each relevant code snippet per review plan',
    ],
  },
  {
    step: 'test_generation' as WorkflowStep,
    label: 'Test Generation',
    icon: <TestIcon />, 
    steps: [
      'Parsing text patch file to understand the changes',
      'Retrieving existing test cases for the testing classes',
      'Analyzing existing test cases to understand the coverage and edge cases',
      'Generating new test cases for the testing classes',
    ],
  },
];

interface AgentOutputTabsProps {
  agentOutputs: Record<WorkflowStep, any>;
  onWorkflowUpdate: (step: WorkflowStep, status: WorkflowStatus, output?: any) => void;
  onResetWorkflow: () => void;
  hasPRData?: boolean;
  prBaseDir?: string | null;
  externalStartEvent?: string;
  currentStep?: WorkflowStep | null;
}

const AgentOutputTabs: React.FC<AgentOutputTabsProps> = ({
  agentOutputs,
  onWorkflowUpdate,
  onResetWorkflow,
  hasPRData = false,
  prBaseDir,
  externalStartEvent,
  currentStep,
}) => {
  const [tabValue, setTabValue] = useState(0);
  console.log('AgentOutputTabs hasPRData:', hasPRData);
  // Use a ref to always access the latest hasPRData in event handlers
  const hasPRDataRef = React.useRef(hasPRData);
  React.useEffect(() => {
    hasPRDataRef.current = hasPRData;
  }, [hasPRData]);
  // Use a ref to always access the latest prBaseDir in event handlers
  const prBaseDirRef = React.useRef(prBaseDir);
  React.useEffect(() => {
    prBaseDirRef.current = prBaseDir;
  }, [prBaseDir]);
  const [isRunning, setIsRunning] = useState(false);
  const [showPRWarning, setShowPRWarning] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State for substep progress
  const [substepProgress, setSubstepProgress] = useState<{ [step in WorkflowStep]?: number }>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStartWorkflow = async () => {
    console.log('handleStartWorkflow called, hasPRData:', hasPRDataRef.current, 'prBaseDir:', prBaseDirRef.current);
    // Check if PR data is loaded
    if (!hasPRDataRef.current) {
      setShowPRWarning(true);
      // Hide warning after 3 seconds
      setTimeout(() => setShowPRWarning(false), 3000);
      return;
    }
    setIsRunning(true);
    setFetchError(null);
    
    // Simulate workflow execution
    for (let i = 0; i < stepConfig.length; i++) {
      const step = stepConfig[i].step;
      const substeps = stepConfig[i].steps;
      // Mark step as current (running)
      onWorkflowUpdate(step, 'running');
      // Animate substeps
      for (let j = 0; j < substeps.length; j++) {
        setSubstepProgress(prev => ({ ...prev, [step]: j }));
        await new Promise(resolve => setTimeout(resolve, 900));
      }
      setSubstepProgress(prev => ({ ...prev, [step]: substeps.length }));
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 800));
      // Generate mock output based on step
      let output = generateMockOutput(step);
      // Try to load agent output from file if prBaseDirRef.current is set
      if (prBaseDirRef.current) {
        const agentFileMap: Record<WorkflowStep, string> = {
          routing: 'routing_agent.json',
          architect: 'architect_agent.json',
          review: 'code_review_agent.json',
          test_generation: 'test_generation_agent.json',
        };
        const agentFile = agentFileMap[step];
        const url = `${window.location.origin}/${prBaseDirRef.current}/agent_outputs/${agentFile}`;
        console.log('Attempting to fetch agent output:', url, 'prBaseDir:', prBaseDirRef.current);
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            output = await resp.json();
          } else {
            setFetchError(`Failed to fetch ${url}: ${resp.status} ${resp.statusText}`);
          }
        } catch (e: any) {
          setFetchError(`Fetch error for ${url}: ${e.message}`);
          // fallback to mock output
        }
      }
      // Special logic after routing step
      if (step === 'routing') {
        if (output && output.is_easy === false) {
          // Mark routing as human review required, stop workflow
          onWorkflowUpdate(step, 'human_review_required', output);
          setIsRunning(false);
          return;
        }
      }
      // Mark step as completed and move to next
      onWorkflowUpdate(step, 'completed', output);
      // If architect step, notify ImageSection to load knowledge graph
      if (step === 'architect' && prBaseDirRef.current) {
        window.dispatchEvent(new CustomEvent('load-knowledge-graph', { detail: { prBaseDir: prBaseDirRef.current } }));
      }
    }
    
    // Mark workflow as completed
    onWorkflowUpdate(stepConfig[stepConfig.length - 1].step, 'completed');
    setIsRunning(false);
  };

  const generateMockOutput = (step: WorkflowStep) => {
    switch (step) {
      case 'routing':
        return {
          is_easy: true,
          reason: "PR contains simple bug fixes and follows established patterns. The changes are well-contained and don't introduce architectural complexity.",
          confidence: 0.85
        };
      case 'architect':
        return {
          architect_info: {
            files_affected: 3,
            complexity_score: 0.6,
            architectural_impact: "low",
            dependencies_analyzed: 15
          },
          kd_graph: {
            nodes: 15,
            edges: 25,
            centrality_scores: {
              "DataArray.sel": 0.8,
              "validation_utils": 0.6
            }
          },
          file_function_map: {
            "xarray/core/dataarray.py": ["sel", "validate_indexers"],
            "xarray/core/utils.py": ["validate_boolean_array"]
          }
        };
      case 'review':
        return {
          overall_good: true,
          reasons: [
            "Code follows PEP 8 style guidelines",
            "Proper error handling implemented",
            "No security vulnerabilities detected",
            "Good test coverage for edge cases",
            "Clear and descriptive variable names"
          ],
          issues: []
        };
      case 'test_generation':
        return {
          new_test_cases: [
            {
              test_name: "test_sel_boolean_array_validation",
              test_code: `def test_sel_boolean_array_validation():
    """Test that sel() properly validates boolean array dimensions."""
    data = np.random.randn(10, 20)
    coords = {'x': np.arange(10), 'y': np.arange(20)}
    da = xr.DataArray(data, coords=coords)
    
    # Test valid boolean array
    valid_mask = np.random.choice([True, False], size=(10, 20))
    result = da.sel(x=valid_mask)
    assert result is not None`,
              coverage_type: "edge_case"
            },
            {
              test_name: "test_sel_boolean_array_error_handling",
              test_code: `def test_sel_boolean_array_error_handling():
    """Test error handling for invalid boolean arrays."""
    data = np.random.randn(5, 5)
    coords = {'x': np.arange(5), 'y': np.arange(5)}
    da = xr.DataArray(data, coords=coords)
    
    # Test invalid boolean array
    invalid_mask = np.random.choice([True, False], size=(3, 3))
    with pytest.raises(ValueError, match="Boolean array shape"):
        da.sel(x=invalid_mask)`,
              coverage_type: "error_handling"
            }
          ],
          coverage_improvement: 0.15
        };
      default:
        return {};
    }
  };

  const formatOutput = (output: any): string => {
    if (!output) return 'No output available yet.';
    return JSON.stringify(output, null, 2);
  };

  const getStepStatus = (step: WorkflowStep) => {
    if (step === 'routing' && agentOutputs['routing'] && agentOutputs['routing'].is_easy === false) {
      return 'human_review_required';
    }
    return agentOutputs[step] ? 'completed' : 'pending';
  };

  // Listen for external start workflow event
  React.useEffect(() => {
    if (!externalStartEvent) return;
    const handler = () => {
      console.log('Received external-start-workflow event');
      handleStartWorkflow();
    };
    window.addEventListener(externalStartEvent, handler);
    return () => window.removeEventListener(externalStartEvent, handler);
  }, [externalStartEvent]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Removed Agent Outputs header to save space */}
      
      {showPRWarning && (
        <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
          Please load a PR file first before starting the workflow.
        </Alert>
      )}
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.75rem' }}>
          {fetchError}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: '48px',
              fontSize: '0.75rem',
              fontWeight: 600,
            },
          }}
        >
          {stepConfig.map((stepInfo, index) => {
            const status = getStepStatus(stepInfo.step);
            return (
              <Tab 
                key={index}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stepInfo.icon}
                    <span>{stepInfo.label}</span>
                    {status === 'completed' && (
                      <Chip 
                        label="✓" 
                        size="small" 
                        color="success" 
                        sx={{ minWidth: '16px', height: '16px', fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Box>

      {stepConfig.map((stepInfo, index) => {
        const output = agentOutputs[stepInfo.step];
        const status = getStepStatus(stepInfo.step);
        // Determine if this is the currently running step
        const isStepRunning = currentStep === stepInfo.step && isRunning;
        // For the running step, use substepProgress; for completed, show all; for pending, show all as pending
        let currentSubstep = stepInfo.steps.length;
        if (isStepRunning && typeof substepProgress[stepInfo.step] === 'number') {
          currentSubstep = substepProgress[stepInfo.step]!;
        } else if (status === 'completed') {
          currentSubstep = stepInfo.steps.length;
        } else if (status === 'pending') {
          currentSubstep = 0;
        }
        return (
          <TabPanel
            key={index}
            role="tabpanel"
            hidden={tabValue !== index}
            id={`agent-tabpanel-${index}`}
            aria-labelledby={`agent-tab-${index}`}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} hidden={tabValue !== index}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {stepInfo.label}
                </Typography>
                <VerticalStepper
                  steps={stepInfo.steps}
                  current={currentSubstep}
                  completed={status === 'completed'}
                  isRunning={isStepRunning}
                />
                <Chip
                  label={status === 'human_review_required' ? 'Human Review Needed' : status === 'completed' ? 'Completed' : 'Pending'}
                  color={status === 'human_review_required' ? 'error' : status === 'completed' ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>
              {status === 'completed' ? (
                <OutputContent>
                  {formatOutput(output)}
                </OutputContent>
              ) : status === 'human_review_required' ? (
                <OutputContent>
                  {formatOutput(output)}
                </OutputContent>
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    This agent's output will appear here once the workflow reaches this step.
                  </Typography>
                </Alert>
              )}
            </Box>
          </TabPanel>
        );
      })}
    </Box>
  );
};

// Helper: vertical stepper for agent substeps
const VerticalStepper: React.FC<{
  steps: string[];
  current: number;
  completed: boolean;
  isRunning: boolean;
}> = ({ steps, current, completed, isRunning }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1, mb: 2 }}>
      {steps.map((label, idx) => {
        let icon, textColor, lineColor;
        const completed = idx < current;
        const running = idx === current && isRunning;
        const isInitial = !isRunning && current === 0;
        if (isInitial) {
          icon = <CheckCircleOutlineIcon sx={{ color: '#bdbdbd', fontSize: 22 }} />;
          textColor = '#888';
          lineColor = '#bdbdbd';
        } else if (completed) {
          icon = <CheckCircleIcon sx={{ color: '#388e3c', fontSize: 22 }} />;
          textColor = '#111';
          lineColor = '#388e3c';
        } else if (running) {
          icon = <CircularProgress size={20} sx={{ color: '#1976d2' }} />;
          textColor = '#111';
          lineColor = '#1976d2';
        } else {
          icon = <CheckCircleOutlineIcon sx={{ color: '#bdbdbd', fontSize: 22 }} />;
          textColor = '#888';
          lineColor = '#bdbdbd';
        }
        return (
          <Box key={label} sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative', mb: 1, minHeight: 36 }}>
            {/* Icon and vertical dashed line */}
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1, zIndex: 1 }}>
              <Box sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {icon}
              </Box>
              {idx < steps.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    height: 28,
                    borderLeft: '2px dashed #bdbdbd',
                    marginTop: 0,
                  }}
                />
              )}
            </Box>
            {/* Step label */}
            <Typography
              variant="body2"
              sx={{
                color: textColor,
                fontWeight: 400,
                fontSize: '1rem',
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default AgentOutputTabs; 