import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  TextField,
  Paper,
  Chip,
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

const sampleProblemStatement = `# Problem Statement

This PR addresses a critical bug in the xarray library where the 
DataArray.sel() method was not properly handling multi-dimensional 
indexing with boolean arrays.

## Issue Description
- The sel() method was failing when users tried to select data using 
  boolean arrays with dimensions that didn't match the expected shape
- This caused runtime errors in data analysis workflows
- Affected users working with climate and scientific data

## Proposed Solution
- Add proper dimension checking in the sel() method
- Implement graceful error handling for mismatched dimensions
- Add comprehensive test coverage for edge cases

## Impact
- Fixes data selection issues for scientific computing users
- Improves robustness of xarray operations
- Maintains backward compatibility`;

const samplePatch = `diff --git a/xarray/core/dataarray.py b/xarray/core/dataarray.py
index a1b2c3d..e4f5g6h 100644
--- a/xarray/core/dataarray.py
+++ b/xarray/core/dataarray.py
@@ -1234,6 +1234,15 @@ class DataArray(AbstractArray, DataWithCoords):
         if not isinstance(indexers, dict):
             raise TypeError("indexers must be a dict")
         
+        # Validate boolean array dimensions
+        for key, value in indexers.items():
+            if hasattr(value, 'shape') and len(value.shape) > 0:
+                expected_shape = self.coords[key].shape
+                if value.shape != expected_shape:
+                    raise ValueError(
+                        f"Boolean array shape {value.shape} does not match "
+                        f"expected shape {expected_shape} for coordinate '{key}'"
+                    )
         
         # Apply selection
         result = self._obj.sel(indexers, method=method, tolerance=tolerance)`;

const sampleTestPatch = `import pytest
import numpy as np
import xarray as xr

def test_sel_boolean_array_validation():
    """Test that sel() properly validates boolean array dimensions."""
    
    # Create test data
    data = np.random.randn(10, 20)
    coords = {
        'x': np.arange(10),
        'y': np.arange(20)
    }
    da = xr.DataArray(data, coords=coords)
    
    # Test valid boolean array
    valid_mask = np.random.choice([True, False], size=(10, 20))
    result = da.sel(x=valid_mask)
    assert result is not None
    
    # Test invalid boolean array (should raise error)
    invalid_mask = np.random.choice([True, False], size=(5, 10))
    with pytest.raises(ValueError, match="Boolean array shape"):
        da.sel(x=invalid_mask)

def test_sel_boolean_array_edge_cases():
    """Test edge cases for boolean array selection."""
    
    data = np.random.randn(5, 5)
    coords = {'x': np.arange(5), 'y': np.arange(5)}
    da = xr.DataArray(data, coords=coords)
    
    # Test empty boolean array
    empty_mask = np.array([], dtype=bool)
    with pytest.raises(ValueError):
        da.sel(x=empty_mask)
    
    # Test scalar boolean
    scalar_bool = True
    result = da.sel(x=scalar_bool)
    assert result is not None`;

interface PRData {
  "PROBLEM STATEMENT": string;
  "PATCH": string;
  "TEST PATCH": string;
}

interface InputTabsProps {
  onReset?: () => void;
  onPRDataChange?: (hasData: boolean) => void;
}

const InputTabs: React.FC<InputTabsProps> = ({ onReset, onPRDataChange }) => {
  const [tabValue, setTabValue] = useState(0);
  const [prData, setPrData] = useState<PRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prFileName, setPrFileName] = useState<string | null>(null);

  // Listen for reset events
  useEffect(() => {
    if (onReset) {
      const handleReset = () => {
        setPrData(null);
        setError(null);
        setPrFileName(null);
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
  }, [onReset, onPRDataChange]);

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
        
        setPrData(data);
        setError(null);
        setPrFileName(file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse JSON file');
        setPrData(null);
        setPrFileName(null);
      }
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