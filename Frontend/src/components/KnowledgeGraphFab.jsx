import React, { useState, useRef, Suspense } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d')); // Lazy load

// Floating Action Button for Knowledge Graph
export default function KnowledgeGraphFab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const graphRef = useRef(null);
  // Try to get workspaceId from the URL if present
  let { workspaceId } = useParams();
  // If not present, fallback to window.location (optional: enhance this logic as needed)
  if (!workspaceId) {
    const match = window.location.pathname.match(/workspace\/(\w+)/);
    if (match) workspaceId = match[1];
  }
  const [loading, setLoading] = useState(false);

  const handleGenerateGraph = async () => {
    if (!workspaceId) {
      toast.error('Workspace ID not found. Open a workspace first.');
      return;
    }
    setLoading(true);
    try {
      // Get auth token
      const token = localStorage.getItem('notion_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      // 1. POST to upload
      const uploadRes = await fetch('http://localhost:8080/api/ai/upload', {
        method: 'POST',
        headers,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      // toast.success('Data uploaded successfully');
      // 2. GET the graph
      const graphRes = await fetch(`http://localhost:8080/api/ai/graph?workspaceId=${workspaceId}`, {
        method: 'GET',
        headers,
      });
      if (!graphRes.ok) throw new Error('Failed to fetch knowledge graph');
      const graphJson = await graphRes.json();
      // Optionally: show a modal or visualize graphJson here
      toast.success('Knowledge graph generated!');
      setGraphData(graphJson);
      setModalOpen(true);
    } catch (err) {
      toast.error('Knowledge graph generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleGenerateGraph}
        disabled={loading}
        className={
          'fixed z-50 bottom-24 right-6 flex items-center gap-2 px-5 py-3 rounded-full shadow-xl bg-gradient-to-r from-purple-500 to-orange-500 text-white font-semibold text-base transition-all hover:scale-105 focus:outline-none ' +
          (loading ? 'opacity-60 cursor-not-allowed' : '')
        }
        style={{ boxShadow: '0 8px 24px rgba(80,0,80,0.18)' }}
        aria-label="Generate Knowledge Graph"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="mr-2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span className="hidden sm:inline">{loading ? 'Generating...' : 'Knowledge Graph'}</span>
        <span className="sm:hidden">{loading ? '...' : ''}</span>
      </button>
      {/* Modal for Knowledge Graph */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full relative overflow-hidden">
            <button
              className="absolute top-3 right-3 z-10 text-gray-600 hover:text-orange-500 p-2 rounded-full bg-gray-100"
              onClick={() => setModalOpen(false)}
              aria-label="Close graph"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="p-4 border-b flex items-center gap-2">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-orange-500"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span className="font-semibold text-lg text-gray-800">Knowledge Graph</span>
            </div>
            <div className="p-2" style={{ height: 500, background: '#fff' }}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading graph...</div>}>
                {graphData && (
                  <ForceGraph2D
                    ref={graphRef}
                    width={700}
                    height={480}
                    graphData={{
                      nodes: graphData.nodes.map(n => ({ ...n, name: n.label })),
                      links: graphData.edges.map(e => ({ ...e, source: e.from, target: e.to }))
                    }}
                    nodeLabel={node => node.label}
                    nodeAutoColorBy="id"
                    linkWidth={link => 2}
                    linkColor={() => '#e2e8f0'}
                    onLinkHover={setHoveredEdge}
                    linkDirectionalArrowLength={4}
                    linkDirectionalArrowRelPos={1}
                    nodeCanvasObjectMode={() => 'after'}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                      const label = node.label;
                      const fontSize = 14 / globalScale;
                      ctx.font = `${fontSize}px Sans-Serif`;
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillStyle = '#1f2937';
                      ctx.fillText(label, node.x, node.y + 18);
                    }}
                  />
                )}
                {/* Edge tooltip */}
                {hoveredEdge && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(hoveredEdge.__controlPoints?.[0]?.x || 350) - 40}px`,
                      top: `${(hoveredEdge.__controlPoints?.[0]?.y || 50) - 30}px`,
                      pointerEvents: 'none',
                      zIndex: 1000
                    }}
                    className="bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg"
                  >
                    Score: {hoveredEdge.score?.toFixed(3)}
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
