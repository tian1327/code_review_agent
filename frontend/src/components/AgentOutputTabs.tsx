import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper,
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
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { WorkflowStep, WorkflowStatus } from '../types/workflow';

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  height: '400px', // Match InputTabs output box height
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
  height: '340px', // Match the TextField's content area
  maxHeight: '340px',
  overflow: 'auto',
}));

const stepConfig = [
  {
    step: 'routing' as WorkflowStep,
    label: 'PR Routing',
    icon: <RouteIcon />,
    description: 'Determines PR complexity and routing decision',
  },
  {
    step: 'architect' as WorkflowStep,
    label: 'Architect Analysis',
    icon: <ArchitectureIcon />,
    description: 'Builds knowledge graph and analyzes architecture',
  },
  {
    step: 'review' as WorkflowStep,
    label: 'Code Review',
    icon: <ReviewIcon />,
    description: 'Performs comprehensive code review',
  },
  {
    step: 'test_generation' as WorkflowStep,
    label: 'Test Generation',
    icon: <TestIcon />,
    description: 'Generates additional unit tests',
  },
];

interface AgentOutputTabsProps {
  agentOutputs: Record<WorkflowStep, any>;
  onWorkflowUpdate: (step: WorkflowStep, status: WorkflowStatus, output?: any) => void;
  onResetWorkflow: () => void;
  hasPRData?: boolean;
}

const AgentOutputTabs: React.FC<AgentOutputTabsProps> = ({
  agentOutputs,
  onWorkflowUpdate,
  onResetWorkflow,
  hasPRData = false,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showPRWarning, setShowPRWarning] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStartWorkflow = async () => {
    // Check if PR data is loaded
    if (!hasPRData) {
      setShowPRWarning(true);
      // Hide warning after 3 seconds
      setTimeout(() => setShowPRWarning(false), 3000);
      return;
    }
    
    setIsRunning(true);
    
    // Simulate workflow execution
    for (let i = 0; i < stepConfig.length; i++) {
      const step = stepConfig[i].step;
      
      // Mark step as current (running)
      onWorkflowUpdate(step, 'running');
      
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 2000 + i * 1000));
      
      // Generate mock output based on step
      const mockOutput = generateMockOutput(step);
      
      // Mark step as completed and move to next
      onWorkflowUpdate(step, 'completed', mockOutput);
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
    return agentOutputs[step] ? 'completed' : 'pending';
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
          Agent Outputs
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onResetWorkflow}
            disabled={isRunning}
            size="small"
            color="secondary"
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={isRunning ? <CircularProgress size={16} /> : <PlayIcon />}
            onClick={handleStartWorkflow}
            disabled={isRunning}
            size="small"
          >
            {isRunning ? 'Running...' : 'Start Workflow'}
          </Button>
        </Box>
      </Box>
      
      {showPRWarning && (
        <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
          Please load a PR file first before starting the workflow.
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
        
        return (
          <TabPanel
            key={index}
            role="tabpanel"
            hidden={tabValue !== index}
            id={`agent-tabpanel-${index}`}
            aria-labelledby={`agent-tab-${index}`}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {stepInfo.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {stepInfo.description}
                </Typography>
                
                <Chip
                  label={status === 'completed' ? 'Completed' : 'Pending'}
                  color={status === 'completed' ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>

              {status === 'completed' ? (
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

export default AgentOutputTabs; 