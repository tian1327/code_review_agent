import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import Header from './components/Header';
import WorkflowProgress from './components/WorkflowProgress';
import BottomSection from './components/BottomSection';
import { WorkflowStep, WorkflowStatus } from './types/workflow';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('pending');
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);
  const [agentOutputs, setAgentOutputs] = useState<Record<WorkflowStep, any>>({} as Record<WorkflowStep, any>);
  const [hasPRData, setHasPRData] = useState(false);
  const [prBaseDir, setPrBaseDir] = useState<string | null>(null); // NEW

  const handleWorkflowUpdate = (step: WorkflowStep, status: WorkflowStatus, output?: any) => {
    setCurrentStep(step);
    setWorkflowStatus(status);
    
    if (status === 'completed') {
      setCompletedSteps(prev => prev.includes(step) ? prev : [...prev, step]);
    }
    // If human review required, do not add to completedSteps
    if (status === 'human_review_required') {
      setCompletedSteps([]); // Optionally clear completed steps
    }
    
    if (output) {
      setAgentOutputs(prev => ({ ...prev, [step]: output }));
    }
  };

  const handleResetWorkflow = () => {
    setCurrentStep(null);
    setWorkflowStatus('pending');
    setCompletedSteps([]);
    setAgentOutputs({} as Record<WorkflowStep, any>);
    setHasPRData(false);
    
    // Reset PR data if the function exists
    if ((window as any).resetPRData) {
      (window as any).resetPRData();
    }
    // Dispatch workflow-reset event for components like ImageSection
    window.dispatchEvent(new Event('workflow-reset'));
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Top Section - Workflow Progress */}
        <Box sx={{ mb: 2 }}>
          <WorkflowProgress 
            currentStep={currentStep}
            completedSteps={completedSteps}
            workflowStatus={workflowStatus}
            humanReview={workflowStatus === 'human_review_required'}
          />
          {workflowStatus === 'human_review_required' && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <span style={{ color: '#d32f2f', fontWeight: 600, fontSize: '1.1rem' }}>
                Check Routing Agent outputs for detailed reasons.
              </span>
            </Box>
          )}
        </Box>

        {/* Bottom Section - Three vertical sections */}
        <BottomSection 
          agentOutputs={agentOutputs}
          onWorkflowUpdate={handleWorkflowUpdate}
          onResetWorkflow={handleResetWorkflow}
          hasPRData={hasPRData}
          onPRDataChange={setHasPRData}
          prBaseDir={prBaseDir}
          onPRBaseDirChange={setPrBaseDir}
          currentStep={currentStep}
        />
      </Container>
    </Box>
  );
};

export default App; 