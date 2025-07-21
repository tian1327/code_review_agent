import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  TextField,
  Button,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Description as DescriptionIcon,
  Code as CodeIcon,
  Science as TestIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  height: '500px',
  overflow: 'auto',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

interface PRData {
  "PROBLEM STATEMENT": string;
  "PATCH": string;
  "TEST PATCH": string;
}

interface InputTabsProps {
  onReset?: () => void;
  onPRDataChange?: (hasData: boolean) => void;
  onPRBaseDirChange?: (baseDir: string | null) => void;
}

const InputTabs: React.FC<InputTabsProps> = ({ onReset, onPRDataChange, onPRBaseDirChange }) => {
  const [tabValue, setTabValue] = useState(0);
  const [prData, setPrData] = useState<PRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prFileName, setPrFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for reset events
  useEffect(() => {
    if (onReset) {
      const handleReset = () => {
        setPrData(null);
        setError(null);
        setPrFileName(null);
        if (onPRBaseDirChange) onPRBaseDirChange(null);
        if (onPRDataChange) {
          onPRDataChange(false);
        }
      };
      
      // Store the reset function globally so it can be called from other components
      (window as any).resetPRData = handleReset;
      
      return () => {
        delete (window as any).resetPRData;
      };
    }
  }, [onReset, onPRDataChange, onPRBaseDirChange]);

  // Notify parent when PR data changes
  useEffect(() => {
    if (onPRDataChange) {
      onPRDataChange(prData !== null);
    }
  }, [prData, onPRDataChange]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as PRData;
        
        // Validate required fields
        if (!data["PROBLEM STATEMENT"] || !data["PATCH"] || !data["TEST PATCH"]) {
          throw new Error("JSON file must contain 'PROBLEM STATEMENT', 'PATCH', and 'TEST PATCH' fields");
        }
        // Try to determine the base directory of the PR file
        let baseDir: string | null = null;
        if ((file as any).webkitRelativePath) {
          // Use the parent directory of the file, relative to public/
          const relPath = (file as any).webkitRelativePath;
          baseDir = relPath.substring(0, relPath.lastIndexOf('/'));
        } else {
          // Use the PR file name (without extension) as the parent directory
          const fileName = file.name;
          const dotIdx = fileName.lastIndexOf('.');
          const folderName = dotIdx !== -1 ? fileName.substring(0, dotIdx) : fileName;
          baseDir = `pr_examples/${folderName}`;
        }
        setPrData(data);
        setError(null);
        setPrFileName(file.name);
        if (onPRBaseDirChange) onPRBaseDirChange(baseDir);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse JSON file');
        setPrData(null);
        setPrFileName(null);
        if (onPRBaseDirChange) onPRBaseDirChange(null);
      }
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const tabs = [
    { 
      label: 'Problem Statement', 
      icon: <DescriptionIcon />, 
      content: prData?.["PROBLEM STATEMENT"] || null 
    },
    { 
      label: 'Patch', 
      icon: <CodeIcon />, 
      content: prData?.["PATCH"] || null 
    },
    { 
      label: 'Test Patch', 
      icon: <TestIcon />, 
      content: prData?.["TEST PATCH"] || null 
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
          Pull Request Details
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          size="small"
          sx={{ fontSize: '0.75rem' }}
        >
          Load PR
          <input
            type="file"
            hidden
            accept=".json"
            onChange={handleFileUpload}
            ref={fileInputRef}
          />
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.75rem' }}>
          {error}
        </Alert>
      )}
      
      {prData && (
        <Alert severity="success" sx={{ mb: 2, fontSize: '0.75rem' }}>
          PR data loaded successfully{prFileName ? `: ${prFileName}` : ''}!
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: '48px',
              fontSize: '0.875rem',
              fontWeight: 600,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {tabs.map((tab, index) => (
        <TabPanel
          key={index}
          role="tabpanel"
          hidden={tabValue !== index}
          id={`input-tabpanel-${index}`}
          aria-labelledby={`input-tab-${index}`}
        >
          <Box sx={{ position: 'relative' }}>
            {tab.content ? (
              <>
                <StyledTextField
                  multiline
                  rows={20}
                  fullWidth
                  value={tab.content}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    style: { 
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: '#f8f9fa',
                    },
                  }}
                />
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '400px',
                textAlign: 'center',
                color: 'text.secondary'
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                  No {tab.label} Content
                </Typography>
                <Typography variant="body2" sx={{ maxWidth: '300px' }}>
                  Load a PR file to view the {tab.label.toLowerCase()} content.
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      ))}
    </Box>
  );
};

export default InputTabs; 