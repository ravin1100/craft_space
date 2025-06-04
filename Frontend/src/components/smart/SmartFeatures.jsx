import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Lightbulb, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AutoLinker from './AutoLinker';
import KnowledgeGraph from './KnowledgeGraph';
import AutoTagGenerator from './AutoTagGenerator';

/**
 * SmartFeatures component that integrates all AI-powered features
 */
const SmartFeatures = ({ 
  content, 
  pageId, 
  existingTags = [], 
  onTagsUpdate,
  onLinkInsert,
  editorRef
}) => {
  const [activeTab, setActiveTab] = useState('tags');
  const [isOpen, setIsOpen] = useState(false);
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle node click in knowledge graph
  const handleNodeClick = (nodeId) => {
    navigate(`/workspace/${workspaceId}/page/${nodeId}`);
    setShowKnowledgeGraph(false);
  };
  
  // Toggle smart features panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  // Toggle knowledge graph modal
  const toggleKnowledgeGraph = () => {
    setShowKnowledgeGraph(!showKnowledgeGraph);
  };
  
  return (
    <>
      {/* Smart Features Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={togglePanel}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 transform hover:scale-105 ${
            isOpen ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
          }`}
          title="Smart Features"
        >
          <Sparkles size={20} />
        </button>
      </div>
      
      {/* Knowledge Graph Button */}
      {/* <div className="fixed bottom-40 right-6 z-40">
        <button
          onClick={toggleKnowledgeGraph}
          className="w-12 h-12 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600 transition-all duration-200 transform hover:scale-105"
          title="Knowledge Graph"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
      </div> */}
      
      {/* Auto-Linker (always active when content changes) */}
      <AutoLinker 
        content={content} 
        onLinkInsert={onLinkInsert}
        editorRef={editorRef}
      />
      
      {/* Smart Features Panel */}
      {isOpen && (
        <div 
          ref={panelRef}
          className="fixed bottom-24 right-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="text-md font-medium text-gray-800 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-500" />
              Smart Features
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`pb-2 px-4 text-sm font-medium ${
                  activeTab === 'tags' 
                    ? 'text-purple-600 border-b-2 border-purple-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('tags')}
              >
                Auto Tags
              </button>
              <button
                className={`pb-2 px-4 text-sm font-medium ${
                  activeTab === 'tips' 
                    ? 'text-purple-600 border-b-2 border-purple-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('tips')}
              >
                Smart Tips
              </button>
            </div>
            
            {activeTab === 'tags' && (
              <AutoTagGenerator
                content={content}
                pageId={pageId}
                existingTags={existingTags}
                onTagsUpdate={onTagsUpdate}
                isActive={isOpen && activeTab === 'tags'}
              />
            )}
            
            {activeTab === 'tips' && (
              <div className="bg-purple-50 rounded-md p-4">
                <div className="flex items-start mb-3">
                  <Lightbulb size={18} className="text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">Smart Features Guide</h4>
                    <ul className="text-xs text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <span className="mr-1">•</span>
                        <span><strong>Auto-Linker:</strong> As you write, we'll suggest links to related pages.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1">•</span>
                        <span><strong>Knowledge Graph:</strong> Visualize connections between your pages.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-1">•</span>
                        <span><strong>Auto Tags:</strong> We'll suggest relevant tags based on your content.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-purple-100">
                  <p>These AI-powered features analyze your content to help organize and connect your knowledge.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Knowledge Graph Modal */}
      {showKnowledgeGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Knowledge Graph
              </h3>
              <button 
                onClick={() => setShowKnowledgeGraph(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <KnowledgeGraph onNodeClick={handleNodeClick} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartFeatures;
