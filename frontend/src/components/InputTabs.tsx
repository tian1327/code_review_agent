import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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
import { marked } from 'marked';
import DiffViewer from 'react-diff-viewer';

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
  externalUploadEvent?: string;
}

export interface InputTabsRef {
  loadPRFile: (file: File) => void;
}

const InputTabs = forwardRef<InputTabsRef, InputTabsProps>(({ onReset, onPRDataChange, onPRBaseDirChange }, ref) => {
  const [tabValue, setTabValue] = useState(0);
  const [prData, setPrData] = useState<PRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Remove local prFileName state, will be managed by parent
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for reset events
  useEffect(() => {
    if (onReset) {
      const handleReset = () => {
        setPrData(null);
        setError(null);
        // setPrFileName(null); // This line is removed
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

  // Handle direct File object (for external event)
  const handleFileObject = (file: File) => {
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
        if (onPRBaseDirChange) onPRBaseDirChange(baseDir);
        if (onPRDataChange) onPRDataChange(true);
        if ((window as any).onPRFileNameChange) (window as any).onPRFileNameChange(file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse JSON file');
        setPrData(null);
        if ((window as any).onPRFileNameChange) (window as any).onPRFileNameChange(null);
        if (onPRBaseDirChange) onPRBaseDirChange(null);
        if (onPRDataChange) onPRDataChange(false);
      }
    };
    reader.readAsText(file);
  };

  // Expose loadPRFile to parent via ref
  useImperativeHandle(ref, () => ({
    loadPRFile: handleFileObject
  }));

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
        // setPrFileName(file.name); // removed, now managed by parent
        if (onPRBaseDirChange) onPRBaseDirChange(baseDir);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse JSON file');
        setPrData(null);
        // setPrFileName(null); // removed, now managed by parent
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
      {/* Removed Pull Request Details header to save space */}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.75rem' }}>
          {error}
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
              index === 0 ? (
                // Render Problem Statement as markdown
                <Box
                  sx={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: 1,
                    p: 2,
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    minHeight: 400,
                    maxHeight: 500,
                    overflow: 'auto',
                  }}
                  dangerouslySetInnerHTML={{ __html: String(marked.parse(tab.content)) }}
                />
              ) : index === 1 ? (
                // Custom minimal diff renderer
                <Box sx={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: 1,
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  minHeight: 400,
                  maxHeight: 500,
                  overflow: 'auto',
                  whiteSpace: 'pre',
                }}>
                  {tab.content.split('\n').map((line, i) => {
                    if (line.startsWith('+') && !line.startsWith('+++')) {
                      return <div key={i} style={{ color: '#388e3c', background: '#e8f5e9' }}>{line}</div>;
                    } else if (line.startsWith('-') && !line.startsWith('---')) {
                      return <div key={i} style={{ color: '#d32f2f', background: '#ffebee' }}>{line}</div>;
                    } else if (line.startsWith('@@')) {
                      return <div key={i} style={{ color: '#1976d2', background: '#e3f2fd' }}>{line}</div>;
                    } else {
                      return <div key={i}>{line}</div>;
                    }
                  })}
                </Box>
              ) : index === 2 ? (
                // Custom minimal diff renderer for TEST PATCH
                <Box sx={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: 1,
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  minHeight: 400,
                  maxHeight: 500,
                  overflow: 'auto',
                  whiteSpace: 'pre',
                }}>
                  {tab.content.split('\n').map((line, i) => {
                    if (line.startsWith('+') && !line.startsWith('+++')) {
                      return <div key={i} style={{ color: '#388e3c', background: '#e8f5e9' }}>{line}</div>;
                    } else if (line.startsWith('-') && !line.startsWith('---')) {
                      return <div key={i} style={{ color: '#d32f2f', background: '#ffebee' }}>{line}</div>;
                    } else if (line.startsWith('@@')) {
                      return <div key={i} style={{ color: '#1976d2', background: '#e3f2fd' }}>{line}</div>;
                    } else {
                      return <div key={i}>{line}</div>;
                    }
                  })}
                </Box>
              ) : (
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
              )
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
});
InputTabs.displayName = 'InputTabs';

export default InputTabs; 