import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { WorkflowStep, WorkflowStatus } from '../types/workflow';
import { 
  Route as RouteIcon, 
  Architecture as ArchitectureIcon,
  RateReview as ReviewIcon,
  Science as TestIcon 
} from '@mui/icons-material';

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  padding: theme.spacing(2),
  position: 'relative',
}));

const StepBox = styled(Paper)<{ $isCompleted: boolean; $isCurrent: boolean }>(({ theme, $isCompleted, $isCurrent }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  minWidth: '140px',
  minHeight: '100px',
  backgroundColor: $isCompleted ? '#4caf50' : $isCurrent ? '#2196f3' : '#e0e0e0',
  color: $isCompleted || $isCurrent ? 'white' : '#666',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const Arrow = styled(Box)<{ $isCompleted: boolean }>(({ theme, $isCompleted }) => ({
  position: 'relative',
  width: '60px',
  height: '3px',
  backgroundColor: $isCompleted ? '#4caf50' : '#e0e0e0',
  borderRadius: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    right: '-8px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '0',
    height: '0',
    borderLeft: '10px solid',
    borderLeftColor: $isCompleted ? '#4caf50' : '#e0e0e0',
    borderTop: '7px solid transparent',
    borderBottom: '7px solid transparent',
  },
}));

const StepIcon = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
  },
}));

const stepConfig = [
  {
    step: 'routing' as WorkflowStep,
    title: 'PR Routing',
    description: 'Determine PR complexity',
    icon: RouteIcon,
  },
  {
    step: 'architect' as WorkflowStep,
    title: 'Architect Analysis',
    description: 'Build knowledge graph',
    icon: ArchitectureIcon,
  },
  {
    step: 'review' as WorkflowStep,
    title: 'Code Review',
    description: 'Review code quality',
    icon: ReviewIcon,
  },
  {
    step: 'test_generation' as WorkflowStep,
    title: 'Test Generation',
    description: 'Generate unit tests',
    icon: TestIcon,
  },
];

interface WorkflowProgressProps {
  currentStep: WorkflowStep | null;
  completedSteps: WorkflowStep[];
  workflowStatus: WorkflowStatus;
  humanReview?: boolean;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStep,
  completedSteps,
  workflowStatus,
  humanReview,
}) => {
  const getStepStatus = (step: WorkflowStep) => {
    // Show completed steps as completed, current step as current, others as pending
    if (completedSteps.includes(step)) return 'completed';
    if (currentStep === step) return 'current';
    return 'pending';
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h4" component="h2" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
        Workflow Progress
      </Typography>
      <ProgressContainer>
        {stepConfig.map((stepInfo, index) => {
          const status = getStepStatus(stepInfo.step);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const IconComponent = stepInfo.icon;

          return (
            <React.Fragment key={stepInfo.step}>
              <StepBox
                $isCompleted={isCompleted}
                $isCurrent={isCurrent}
                elevation={isCompleted || isCurrent ? 4 : 1}
              >
                <StepIcon>
                  <IconComponent />
                </StepIcon>
                <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center', mb: 1 }}>
                  {stepInfo.title}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
                  {stepInfo.description}
                </Typography>
                <Chip
                  label={status.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: isCompleted || isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </StepBox>
              {index < stepConfig.length - 1 && (
                // Arrow is green only if all steps to the left (including this one) are completed
                <Arrow $isCompleted={completedSteps.includes(stepInfo.step)} />
              )}
            </React.Fragment>
          );
        })}
      </ProgressContainer>
      
      {/* Status Summary */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Chip
          label={humanReview ? 'Status: Human Review Needed' : `Status: ${workflowStatus.toUpperCase()}`}
          color={humanReview ? 'error' :
            workflowStatus === 'completed' ? 'success' :
            workflowStatus === 'running' ? 'primary' :
            workflowStatus === 'failed' ? 'error' :
            'default'}
          variant="outlined"
          sx={{ fontSize: '1rem', fontWeight: 600 }}
        />
        {!humanReview && (
          workflowStatus === 'completed' ? (
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', fontWeight: 600 }}>
              Congratulations! Your PR is ready to be integrated.
            </Typography>
          ) : currentStep && (
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
              Currently executing: {stepConfig.find(s => s.step === currentStep)?.title}
            </Typography>
          )
        )}
      </Box>
    </Box>
  );
};

export default WorkflowProgress; 