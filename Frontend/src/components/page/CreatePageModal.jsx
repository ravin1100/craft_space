import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';
import pageService from '../../services/page.service';
import { useParams } from 'react-router-dom';

const CreatePageModal = ({ isOpen, onClose, onPageCreated, workspaceId: propWorkspaceId }) => {
  const { workspaceId: urlWorkspaceId } = useParams();
  // Use propWorkspaceId if available, otherwise fall back to URL params
  const workspaceId = propWorkspaceId || urlWorkspaceId;
  const navigate = useNavigate();
  
  console.log('CreatePageModal - workspaceId:', workspaceId, 'from props:', propWorkspaceId, 'from URL:', urlWorkspaceId);
  
  // Ensure we have a workspace ID
  useEffect(() => {
    if (!workspaceId) {
      console.error('No workspace ID available in CreatePageModal');
      toast.error('No workspace selected');
      onClose();
    }
  }, [workspaceId, onClose]);
  const [pageData, setPageData] = useState({
    title: '',
    content: JSON.stringify({
      type: "doc",
      content: []
    }),
    iconUrl: '',
    parentId: null,
    sortOrder: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission - Current workspaceId:', workspaceId);
    
    if (!workspaceId) {
      console.error('No workspace ID available in CreatePageModal');
      toast.error('No workspace selected. Please try again.');
      onClose();
      return;
    }
    
    if (!pageData.title.trim()) {
      toast.error('Page title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating page with data:', {
        ...pageData,
        workspaceId
      });
      
      const newPage = await pageService.createPage(workspaceId, {
        title: pageData.title.trim(),
        content: pageData.content || '',
        iconUrl: pageData.iconUrl || null,
        parentId: pageData.parentId || null,
        sortOrder: pageData.sortOrder || 0
      });
      
      console.log('Page created successfully:', newPage);
      handlePageCreated(newPage);
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error(error.response?.data?.message || 'Failed to create page');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageCreated = useCallback((newPage) => {
    if (!workspaceId) {
      console.error('No workspace ID available for navigation');
      toast.error('Failed to create page: No workspace selected');
      return;
    }
    
    console.log('Page created, navigating to:', `/workspace/${workspaceId}/page/${newPage.id}`);
    
    toast.success(`Page "${newPage.title}" created successfully`);
    onClose();
    
    // Navigate to the new page in the current workspace
    navigate(`/workspace/${workspaceId}/page/${newPage.id}`);
  }, [workspaceId, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create New Page</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isSubmitting}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={pageData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Page title"
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="iconUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Icon URL (optional)
              </label>
              <input
                type="text"
                id="iconUrl"
                name="iconUrl"
                value={pageData.iconUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/icon.png"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                disabled={isSubmitting || !pageData.title.trim()}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : 'Create Page'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePageModal;
