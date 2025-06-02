import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Network, Share2, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import smartService from '../../services/smart.service';
import ForceGraph2D from 'react-force-graph-2d';

/**
 * KnowledgeGraph component that visualizes the relationships between pages
 */
const KnowledgeGraph = ({ onNodeClick }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { workspaceId } = useParams();
  const graphRef = useRef(null);
  
  // Fetch graph data
  const fetchGraphData = async () => {
    try {
      setIsLoading(true);
      const data = await smartService.getKnowledgeGraph(workspaceId);
      
      // Transform data for the graph visualization
      const transformedData = {
        nodes: data.nodes.map(node => ({
          id: node.id,
          name: node.title,
          val: node.connections || 1, // Size based on number of connections
          color: getNodeColor(node.type),
          type: node.type
        })),
        links: data.links.map(link => ({
          source: link.source,
          target: link.target,
          value: link.strength || 1
        }))
      };
      
      setGraphData(transformedData);
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
      toast.error('Failed to load knowledge graph');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get color based on node type
  const getNodeColor = (type) => {
    switch (type) {
      case 'document':
        return '#f97316'; // orange-500
      case 'tag':
        return '#3b82f6'; // blue-500
      case 'category':
        return '#10b981'; // emerald-500
      default:
        return '#6b7280'; // gray-500
    }
  };
  
  // Handle node click
  const handleNodeClick = (node) => {
    if (onNodeClick && node.type === 'document') {
      onNodeClick(node.id);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Fetch data on mount
  useEffect(() => {
    fetchGraphData();
  }, [workspaceId]);
  
  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50' : 'h-[500px]'
    }`}>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <Network size={18} className="text-orange-500" />
          Knowledge Graph
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchGraphData}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-gray-500 hover:text-gray-700 p-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      
      <div className="relative" style={{ height: isFullscreen ? 'calc(100% - 50px)' : '450px' }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mb-2"></div>
              <p className="text-sm text-gray-600">Building knowledge graph...</p>
            </div>
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <Share2 size={40} className="mx-auto text-gray-300 mb-3" />
              <h4 className="text-lg font-medium text-gray-700 mb-1">No connections yet</h4>
              <p className="text-sm text-gray-500">
                As you create more pages and links, your knowledge graph will grow.
              </p>
            </div>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor="color"
            nodeVal="val"
            linkWidth={link => link.value * 0.5}
            linkColor={() => '#e2e8f0'} // slate-200
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const backgroundNodeSize = node.val * 4;
              
              // Draw node circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, backgroundNodeSize, 0, 2 * Math.PI);
              ctx.fillStyle = node.color;
              ctx.fill();
              
              // Draw text background
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.fillRect(
                node.x - textWidth / 2 - 2,
                node.y + backgroundNodeSize + 2,
                textWidth + 4,
                fontSize + 2
              );
              
              // Draw text
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#1f2937'; // gray-800
              ctx.fillText(
                label,
                node.x,
                node.y + backgroundNodeSize + fontSize / 2 + 4
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;
