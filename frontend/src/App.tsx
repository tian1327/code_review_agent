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

  const handleWorkflowUpdate = (step: WorkflowStep, status: WorkflowStatus, output?: any) => {
    setCurrentStep(step);
    setWorkflowStatus(status);
    
    if (status === 'completed') {
      if (!completedSteps.includes(step)) {
        setCompletedSteps(prev => [...prev, step]);
      }
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
          />
        </Box>

        {/* Bottom Section - Three vertical sections */}
        <BottomSection 
          agentOutputs={agentOutputs}
          onWorkflowUpdate={handleWorkflowUpdate}
          onResetWorkflow={handleResetWorkflow}
          hasPRData={hasPRData}
          onPRDataChange={setHasPRData}
        />
      </Container>
    </Box>
  );
};

export default App; 