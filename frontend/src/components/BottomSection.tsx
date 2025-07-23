import React from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import InputTabs, { InputTabsRef } from './InputTabs';
import ImageSection from './ImageSection';
import AgentOutputTabs from './AgentOutputTabs';
import { WorkflowStep, WorkflowStatus } from '../types/workflow';
import { Button } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import PlayIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface BottomSectionProps {
  agentOutputs: Record<WorkflowStep, any>;
  onWorkflowUpdate: (step: WorkflowStep, status: WorkflowStatus, output?: any) => void;
  onResetWorkflow: () => void;
  hasPRData?: boolean;
  onPRDataChange?: (hasData: boolean) => void;
  prBaseDir?: string | null; // NEW
  onPRBaseDirChange?: (baseDir: string | null) => void; // NEW
  currentStep?: WorkflowStep | null;
}

const BottomSection: React.FC<BottomSectionProps> = ({
  agentOutputs,
  onWorkflowUpdate,
  onResetWorkflow,
  hasPRData = false,
  onPRDataChange,
  prBaseDir,
  onPRBaseDirChange,
}) => {
  const [tabValue, setTabValue] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Ref for InputTabs
  const inputTabsRef = React.useRef<InputTabsRef>(null);

  // State for loaded PR file name
  const [prFileName, setPrFileName] = React.useState<string | null>(null);
  // Automatically switch to Pull Request tab when PR is loaded
  React.useEffect(() => {
    (window as any).onPRFileNameChange = (fileName: string | null) => {
      setPrFileName(fileName);
      if (fileName) setTabValue(0); // Switch to Pull Request tab
    };
    return () => { delete (window as any).onPRFileNameChange; };
  }, []);

  // Automatically switch to Agent Outputs tab when START WORKFLOW is clicked
  React.useEffect(() => {
    const handler = () => setTabValue(1);
    window.addEventListener('external-start-workflow', handler);
    return () => window.removeEventListener('external-start-workflow', handler);
  }, []);

  // Listen for external-pr-upload event and call loadPRFile on InputTabs
  React.useEffect(() => {
    const handler = (e: any) => {
      const file = e.detail?.file;
      if (file && inputTabsRef.current) {
        inputTabsRef.current.loadPRFile(file);
      }
    };
    window.addEventListener('external-pr-upload', handler);
    return () => window.removeEventListener('external-pr-upload', handler);
  }, []);

  // Automatically switch to Pull Request tab when RESET is clicked
  React.useEffect(() => {
    const handler = () => {
      setTabValue(0);
      // Also switch InputTabs to Problem Statement tab if ref is available
      if (inputTabsRef.current && typeof inputTabsRef.current.setTabValue === 'function') {
        inputTabsRef.current.setTabValue(0);
      }
    };
    window.addEventListener('workflow-reset', handler);
    return () => window.removeEventListener('workflow-reset', handler);
  }, []);

  return (
    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ height: '100%', p: 2, backgroundColor: '#fafafa', border: '1px solid #e0e0e0', maxWidth: '1200px', width: '100%' }}>
        {/* Top action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            size="small"
            sx={{ fontSize: '0.85rem' }}
          >
            Load PR
            <input
              type="file"
              hidden
              accept=".json"
              onClick={e => { (e.target as HTMLInputElement).value = ''; }}
              onChange={e => {
                // Forward to InputTabs handler via custom event
                const file = e.target.files?.[0];
                if (file) {
                  const event = new CustomEvent('external-pr-upload', { detail: { file } });
                  window.dispatchEvent(event);
                }
              }}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            size="small"
            sx={{ fontSize: '0.85rem' }}
            onClick={() => window.dispatchEvent(new Event('external-start-workflow'))}
          >
            Start Workflow
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            size="small"
            color="secondary"
            sx={{ fontSize: '0.85rem' }}
            onClick={onResetWorkflow}
          >
            Reset
          </Button>
        </Box>
        {/* PR data loaded success message below LOAD PR button */}
        {hasPRData && prFileName && (
          <Box sx={{ mb: 2 }}>
            <Paper elevation={0} sx={{ background: 'none', p: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: '#388e3c', fontSize: 22, mr: 0.5 }} />
                <span style={{ color: '#388e3c', fontWeight: 600, fontSize: '0.95rem' }}>
                  PR data loaded successfully: {prFileName}
                </span>
              </Box>
            </Paper>
          </Box>
        )}
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Pull Request" />
          <Tab label="Agent Outputs" />
          <Tab label="Architect Analysis" />
        </Tabs>
        <Box sx={{ height: '600px', overflow: 'auto', position: 'relative' }}>
          {/* Always mount all tabs, only show the selected one */}
          <Box sx={{ display: tabValue === 0 ? 'block' : 'none', height: '100%' }}>
            <InputTabs
              ref={inputTabsRef}
              onReset={onResetWorkflow}
              onPRDataChange={onPRDataChange}
              onPRBaseDirChange={onPRBaseDirChange}
            />
          </Box>
          <Box sx={{ display: tabValue === 1 ? 'block' : 'none', height: '100%' }}>
            <AgentOutputTabs
              agentOutputs={agentOutputs}
              onWorkflowUpdate={onWorkflowUpdate}
              onResetWorkflow={onResetWorkflow}
              hasPRData={hasPRData}
              prBaseDir={prBaseDir}
              externalStartEvent="external-start-workflow"
              currentStep={typeof window !== 'undefined' && (window as any).currentStep !== undefined ? (window as any).currentStep : undefined}
            />
          </Box>
          <Box sx={{ display: tabValue === 2 ? 'block' : 'none', height: '100%' }}>
            <ImageSection
              prBaseDir={prBaseDir}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default BottomSection; 