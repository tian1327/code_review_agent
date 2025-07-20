// @ts-ignore
import ForceGraph2D from 'react-force-graph-2d';
import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Alert, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

type NodeType = {
  id: string;
  label: string;
  x?: number;
  y?: number;
};

type EdgeType = {
  source: string;
  target: string;
};

type GraphDataType = {
  nodes: NodeType[];
  edges: EdgeType[];
};

type ForceGraphFormat = {
  nodes: NodeType[];
  links: EdgeType[];
};

const GraphContainer = styled(Box)(({ theme }) => ({
  border: '2px dashed #ccc',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: '#fafafa',
  transition: 'all 0.3s ease',
  minHeight: 400,
  height: 400,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const convertToForceGraphFormat = (data: GraphDataType): ForceGraphFormat => {
  return {
    nodes: data.nodes,
    links: data.edges.map((e: EdgeType) => ({ ...e }))
  };
};

// Placeholder repo info (default to N/A)
const repoInfo = {
  files: 'N/A',
  folders: 'N/A',
  modules: 'N/A',
  classes: 'N/A',
  functions: 'N/A',
  methods: 'N/A'
};

const ImageSection: React.FC = () => {
  const [graphData, setGraphData] = useState<ForceGraphFormat | null>(null);
  const [graphName, setGraphName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for global reset event
  React.useEffect(() => {
    const handler = () => {
      setGraphData(null);
      setGraphName('');
      setError(null);
    };
    window.addEventListener('workflow-reset', handler);
    return () => window.removeEventListener('workflow-reset', handler);
  }, []);

  const handleGraphUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as GraphDataType;
        if (!data.nodes || !data.edges) throw new Error('Invalid graph format');
        setGraphData(convertToForceGraphFormat(data));
        setGraphName(file.name);
        setError(null);
      } catch (err) {
        setError('Failed to load graph: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
          Knowledge Graph Visualization
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          size="small"
        >
          Load Graph
          <input
            type="file"
            hidden
            accept=".json"
            ref={fileInputRef}
            onChange={handleGraphUpload}
          />
        </Button>
      </Box>
      {graphName && (
        <Typography variant="body2" sx={{ color: '#888', mb: 0.5 }}>{graphName}</Typography>
      )}
      {/* Subheader: Repo Info (grey, two rows, aesthetic layout) */}
      <Box sx={{ mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 0.5, justifyContent: 'center' }}>
          <Chip label={`Folders: ${repoInfo.folders}`} size="small" sx={{ bgcolor: '#e0e0e0', color: '#555', fontWeight: 500 }} />
          <Chip label={`Files: ${repoInfo.files}`} size="small" sx={{ bgcolor: '#e0e0e0', color: '#555', fontWeight: 500 }} />
          <Chip label={`Modules: ${repoInfo.modules}`} size="small" sx={{ bgcolor: '#e0e0e0', color: '#555', fontWeight: 500 }} />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
          <Chip label={`Methods: ${repoInfo.methods}`} size="small" sx={{ bgcolor: '#e0e0e0', color: '#555', fontWeight: 500 }} />
          <Chip label={`Functions: ${repoInfo.functions}`} size="small" sx={{ bgcolor: '#e0e0e0', color: '#555', fontWeight: 500 }} />
          <Chip label={`Classes: ${repoInfo.classes}`} size="small" sx={{ bgcolor: '#e0e0e0', color: '#555', fontWeight: 500 }} />
        </Stack>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 1, textAlign: 'left' }}>
        Each node is a function. Edge from A to B means A calls B.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <GraphContainer>
        {graphData ? (
          <ForceGraph2D
            graphData={graphData}
            linkDirectionalArrowLength={12}
            linkDirectionalArrowRelPos={0.95}
            nodeLabel={(node: NodeType) => node.label}
            nodeCanvasObject={(node: NodeType, ctx: CanvasRenderingContext2D, globalScale: number) => {
              ctx.beginPath();
              ctx.arc(node.x!, node.y!, 18, 0, 2 * Math.PI, false);
              ctx.fillStyle = '#1976d2';
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 2;
              ctx.stroke();
              // Do not draw label
            }}
            linkColor={() => '#888'}
            width={window.innerWidth / 3.2}
            height={360}
          />
        ) : (
          <Typography variant="body2" sx={{ color: '#888' }}>
            No graph loaded. Click "Load Graph" to select a knowledge graph JSON file.
          </Typography>
        )}
      </GraphContainer>
    </Box>
  );
};

export default ImageSection; 