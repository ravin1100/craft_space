import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Tag, X, Plus, Check, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import smartService from '../../services/smart.service';
import { debounce } from 'lodash';

/**
 * AutoTagGenerator component that suggests tags based on page content
 */
const AutoTagGenerator = ({ content, pageId, existingTags = [], onTagsUpdate, isActive = false }) => {
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [aiTagsLoading, setAiTagsLoading] = useState(false);
  const [aiTags, setAiTags] = useState([]);
  const { workspaceId } = useParams();
  
  // Initialize selected tags from existing tags
  useEffect(() => {
    if (existingTags && existingTags.length > 0) {
      setSelectedTags(existingTags);
    }
  }, [existingTags]);
  
  // Load AI-generated tags when the component becomes active
  useEffect(() => {
    if (isActive && pageId) {
      loadAiGeneratedTags();
    }
  }, [isActive, pageId]);
  
  // Function to load AI-generated tags
  const loadAiGeneratedTags = async () => {
    if (!pageId) return;
    
    try {
      setAiTagsLoading(true);
      const tags = await smartService.getAiGeneratedTags(pageId);
      setAiTags(tags);
      
      // If we have AI tags and no suggested tags yet, show them
      if (tags.length > 0 && suggestedTags.length === 0) {
        // Filter out tags that are already selected
        const newTags = tags.filter(tag => !selectedTags.includes(tag));
        if (newTags.length > 0) {
          setSuggestedTags(newTags);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error loading AI-generated tags:', error);
      toast.error('Failed to load AI tags');
    } finally {
      setAiTagsLoading(false);
    }
  };
  
  // Debounced function to generate tags
  const debouncedGenerateTags = useCallback(
    debounce(async (text) => {
      if (!text || text.length < 50) {
        return;
      }
      
      try {
        setIsLoading(true);
        const tags = await smartService.generateTags(workspaceId, text);
        
        if (tags && tags.length > 0) {
          // Filter out tags that are already selected
          const newTags = tags.filter(tag => !selectedTags.includes(tag));
          setSuggestedTags(newTags);
          setIsVisible(newTags.length > 0);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Error generating tags:', error);
      } finally {
        setIsLoading(false);
      }
    }, 1500),
    [workspaceId, selectedTags]
  );
  
  // Watch for content changes
  useEffect(() => {
    if (content) {
      debouncedGenerateTags(content);
    }
    
    return () => {
      debouncedGenerateTags.cancel();
    };
  }, [content, debouncedGenerateTags]);
  
  // Add a tag
  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      const newSelectedTags = [...selectedTags, tag];
      setSelectedTags(newSelectedTags);
      
      // Remove from suggestions
      setSuggestedTags(suggestedTags.filter(t => t !== tag));
      
      // Update tags on the page
      if (pageId) {
        updatePageTags(newSelectedTags);
      }
      
      if (onTagsUpdate) {
        onTagsUpdate(newSelectedTags);
      }
    }
  };
  
  // Remove a tag
  const removeTag = (tag) => {
    const newSelectedTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newSelectedTags);
    
    // Update tags on the page
    if (pageId) {
      updatePageTags(newSelectedTags);
    }
    
    if (onTagsUpdate) {
      onTagsUpdate(newSelectedTags);
    }
  };
  
  // Update tags on the page via API
  const updatePageTags = async (tags) => {
    try {
      setIsLoading(true);
      // Call the API with the correct format
      await smartService.updatePageTags(workspaceId, pageId, tags);
      toast.success('Tags updated successfully');
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply all suggested tags
  const applyAllTags = () => {
    const newSelectedTags = [...new Set([...selectedTags, ...suggestedTags])];
    setSelectedTags(newSelectedTags);
    setSuggestedTags([]);
    setIsVisible(false);
    
    // Update tags on the page
    if (pageId) {
      updatePageTags(newSelectedTags);
    }
    
    if (onTagsUpdate) {
      onTagsUpdate(newSelectedTags);
    }
    
    toast.success('All tags applied');
  };
  
  return (
    <div className="mt-4">
      {/* Selected Tags */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Tag size={16} className="text-orange-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">Tags</h4>
          </div>
          
          {pageId && (
            <button 
              onClick={loadAiGeneratedTags}
              className="text-xs bg-purple-500 text-white px-2 py-1 rounded-md flex items-center"
              disabled={aiTagsLoading}
            >
              {aiTagsLoading ? (
                <>
                  <Loader size={12} className="mr-1 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Generate AI Tags</>
              )}
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {selectedTags.length === 0 ? (
            <span className="text-sm text-gray-400">No tags yet</span>
          ) : (
            selectedTags.map((tag, index) => (
              <div 
                key={index} 
                className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center"
              >
                <span>{tag}</span>
                <button 
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-orange-500 hover:text-orange-700"
                >
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* AI Tags Section */}
      {isVisible && aiTags.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-md p-3 mt-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-purple-800 flex items-center">
              <Tag size={14} className="text-purple-500 mr-1" />
              AI Generated Tags
            </h4>
            <button
              onClick={() => setIsVisible(false)}
              className="text-purple-500 hover:text-purple-700 p-1 rounded-full ml-2"
              aria-label="Close AI Tags"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiTags.map((tag, index) => (
              <button
                key={`ai-${index}`}
                onClick={() => addTag(tag)}
                className={`text-xs px-2 py-1 rounded-full flex items-center ${selectedTags.includes(tag) 
                  ? 'bg-purple-200 text-purple-800 opacity-50' 
                  : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-100'}`}
                disabled={selectedTags.includes(tag)}
              >
                <span>{tag}</span>
                {!selectedTags.includes(tag) && <Plus size={12} className="ml-1 text-purple-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoTagGenerator;
