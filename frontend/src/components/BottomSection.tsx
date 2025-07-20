import React from 'react';
import { Box, Grid, Paper } from '@mui/material';
import InputTabs from './InputTabs';
import ImageSection from './ImageSection';
import AgentOutputTabs from './AgentOutputTabs';
import { WorkflowStep, WorkflowStatus } from '../types/workflow';

interface BottomSectionProps {
  agentOutputs: Record<WorkflowStep, any>;
  onWorkflowUpdate: (step: WorkflowStep, status: WorkflowStatus, output?: any) => void;
  onResetWorkflow: () => void;
  hasPRData?: boolean;
  onPRDataChange?: (hasData: boolean) => void;
}

const BottomSection: React.FC<BottomSectionProps> = ({
  agentOutputs,
  onWorkflowUpdate,
  onResetWorkflow,
  hasPRData = false,
  onPRDataChange,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3} sx={{ minHeight: '500px' }}>
        {/* Left Section - Input Tabs */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              p: 2,
              backgroundColor: '#fafafa',
              border: '1px solid #e0e0e0',
            }}
          >
            <InputTabs onReset={onResetWorkflow} onPRDataChange={onPRDataChange} />
          </Paper>
        </Grid>

        {/* Center Section - Image */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              p: 2,
              backgroundColor: '#fafafa',
              border: '1px solid #e0e0e0',
            }}
          >
            <ImageSection />
          </Paper>
        </Grid>

        {/* Right Section - Agent Output Tabs */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              p: 2,
              backgroundColor: '#fafafa',
              border: '1px solid #e0e0e0',
            }}
          >
            <AgentOutputTabs 
              agentOutputs={agentOutputs}
              onWorkflowUpdate={onWorkflowUpdate}
              onResetWorkflow={onResetWorkflow}
              hasPRData={hasPRData}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BottomSection; 