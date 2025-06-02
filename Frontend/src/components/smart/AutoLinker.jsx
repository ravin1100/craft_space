import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Link, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import smartService from '../../services/smart.service';
import { debounce } from 'lodash';

/**
 * AutoLinker component that suggests links to other pages based on content
 * It appears as a floating panel when writing content
 */
const AutoLinker = ({ content, onLinkInsert, editorRef }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { workspaceId } = useParams();
  
  // Debounced function to get link suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (text) => {
      if (!text || text.length < 20) {
        setSuggestions([]);
        setIsVisible(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const suggestedLinks = await smartService.getSuggestedLinks(workspaceId, text);
        
        if (suggestedLinks && suggestedLinks.length > 0) {
          setSuggestions(suggestedLinks);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Error getting link suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 1000),
    [workspaceId]
  );
  
  // Watch for content changes
  useEffect(() => {
    if (content) {
      debouncedGetSuggestions(content);
    }
    
    return () => {
      debouncedGetSuggestions.cancel();
    };
  }, [content, debouncedGetSuggestions]);
  
  // Handle inserting a link
  const handleInsertLink = (suggestion) => {
    if (onLinkInsert) {
      onLinkInsert(suggestion);
      toast.success(`Linked to "${suggestion.title}"`);
      setIsVisible(false);
    }
  };
  
  // If no suggestions or not visible, don't render
  if (!isVisible || suggestions.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-24 left-6 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Link size={16} className="text-orange-500" />
          Suggested Links
        </h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="p-2 max-h-60 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <ul className="space-y-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id} className="text-sm">
                <button
                  onClick={() => handleInsertLink(suggestion)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center justify-between group"
                >
                  <span className="truncate flex-1">{suggestion.title}</span>
                  <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={14} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AutoLinker;
