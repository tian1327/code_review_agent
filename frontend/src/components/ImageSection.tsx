// @ts-ignore
import ForceGraph2D from 'react-force-graph-2d';
import React, { useState } from 'react';
import { Box, Typography, Alert, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

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

interface ImageSectionProps {
  prBaseDir?: string | null;
}

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
const defaultRepoInfo = {
  files: 'N/A',
  folders: 'N/A',
  modules: 'N/A',
  classes: 'N/A',
  functions: 'N/A',
  characters: 'N/A'
};

const ImageSection: React.FC<ImageSectionProps> = ({ prBaseDir }) => {
  const [graphData, setGraphData] = useState<ForceGraphFormat | null>(null);
  const [graphName, setGraphName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [repoInfo, setRepoInfo] = useState(defaultRepoInfo);
  const [repoInfoError, setRepoInfoError] = useState<string | null>(null);
  // Track if the knowledge graph is loaded
  const [graphLoaded, setGraphLoaded] = useState(false);

  // Listen for global reset event
  React.useEffect(() => {
    const handler = () => {
      setGraphData(null);
      setGraphName('');
      setError(null);
      setRepoInfo(defaultRepoInfo);
      setGraphLoaded(false);
    };
    window.addEventListener('workflow-reset', handler);
    return () => window.removeEventListener('workflow-reset', handler);
  }, []);

  // Listen for architect step completion to auto-load knowledge graph
  React.useEffect(() => {
    const handler = (e: any) => {
      const baseDir = e.detail?.prBaseDir || prBaseDir;
      if (baseDir) {
        // Load knowledge graph
        const url = `${window.location.origin}/${baseDir}/agent_outputs/knowledge_graph.json`;
        fetch(url)
          .then(resp => resp.json())
          .then(data => {
            if (!data.nodes || !data.edges) throw new Error('Invalid graph format');
            setGraphData(convertToForceGraphFormat(data));
            setGraphName('knowledge_graph.json');
            setError(null);
            setGraphLoaded(true);
          })
          .catch(err => {
            setError('Failed to load graph: ' + (err instanceof Error ? err.message : 'Unknown error'));
          });
        // Load repo info
        const repoInfoUrl = `${window.location.origin}/${baseDir}/agent_outputs/repo_info.json`;
        fetch(repoInfoUrl)
          .then(resp => resp.json())
          .then(data => {
            console.log('Loaded repo_info.json:', data);
            setRepoInfo({
              files: data.files ?? data.Files ?? 'N/A',
              folders: data.folders ?? data.Folders ?? 'N/A',
              modules: data.modules ?? data.Modules ?? 'N/A',
              classes: data.classes ?? data.Classes ?? 'N/A',
              functions: data.functions ?? data.Functions ?? 'N/A',
              characters: data.characters ?? data.Characters ?? 'N/A',
            });
            setRepoInfoError(null);
          })
          .catch((err) => {
            setRepoInfo(defaultRepoInfo);
            setRepoInfoError('Failed to load repo_info.json');
            console.warn('Failed to load repo_info.json:', err);
          });
      }
    };
    window.addEventListener('load-knowledge-graph', handler);
    return () => window.removeEventListener('load-knowledge-graph', handler);
  }, [prBaseDir]);

  // Debug: log repoInfo state on every render
  console.log('Current repoInfo state:', repoInfo);

  // Helper to format numbers with commas
  const formatNumber = (val: any) => {
    if (typeof val === 'number') return val.toLocaleString();
    if (!isNaN(Number(val))) return Number(val).toLocaleString();
    return val;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <React.Fragment>
        {/* Removed Architect Analysis header to save space */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#222', textAlign: 'left', width: '100%' }}>
          Overall Repo Statistics
        </Typography>
        {/* Subheader: Repo Info (grey, two rows, aesthetic layout) */}
        <Box sx={{ mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 0.5, justifyContent: 'center' }}>
            <Chip label={`Folders: ${formatNumber(repoInfo.folders)}`} size="small" sx={{ bgcolor: graphLoaded ? '#b3e5fc' : '#e0e0e0', color: '#555' }} />
            <Chip label={`Files: ${formatNumber(repoInfo.files)}`} size="small" sx={{ bgcolor: graphLoaded ? '#c8e6c9' : '#e0e0e0', color: '#555' }} />
            <Chip label={`Modules: ${formatNumber(repoInfo.modules)}`} size="small" sx={{ bgcolor: graphLoaded ? '#ffe0b2' : '#e0e0e0', color: '#555' }} />
            <Chip label={`Classes: ${formatNumber(repoInfo.classes)}`} size="small" sx={{ bgcolor: graphLoaded ? '#f8bbd0' : '#e0e0e0', color: '#555' }} />
            <Chip label={`Functions: ${formatNumber(repoInfo.functions)}`} size="small" sx={{ bgcolor: graphLoaded ? '#d1c4e9' : '#e0e0e0', color: '#555' }} />
            <Chip label={`Words: ${formatNumber(repoInfo.characters ?? 'N/A')}`} size="small" sx={{ bgcolor: graphLoaded ? '#fff9c4' : '#e0e0e0', color: '#555' }} />
          </Stack>
        </Box>
        {repoInfoError && (
          <Alert severity="warning" sx={{ mb: 1 }}>{repoInfoError}</Alert>
        )}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2, color: '#222', textAlign: 'left', width: '100%' }}>
          Knowledge Graph Visualization
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 1, textAlign: 'left' }}>
          Each node is a function. Edge from A to B means function A calls B.
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
              Knowledge graph will appear after Architect Analysis is completed.
            </Typography>
          )}
        </GraphContainer>
      </React.Fragment>
    </Box>
  );
};

export default ImageSection; 