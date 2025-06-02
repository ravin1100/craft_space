import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import trashService from '../services/trash.service';

export default function TrashPage() {
  const { workspaceId } = useParams();
  const [trashedPages, setTrashedPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingPageIds, setDeletingPageIds] = useState([]);

  useEffect(() => {
    fetchTrashedPages();
  }, [workspaceId]);

  const fetchTrashedPages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trashService.getTrashedPages(workspaceId);
      setTrashedPages(data);
    } catch (err) {
      console.error("Error fetching trashed pages:", err);
      setError("Failed to load trashed pages. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHardDelete = async (pageId) => {
    try {
      setDeletingPageIds(prev => [...prev, pageId]);
      await trashService.hardDeletePage(workspaceId, pageId);
      setTrashedPages(prev => prev.filter(page => page.id !== pageId));
      toast.success('Page permanently deleted');
    } catch (err) {
      console.error("Error deleting page:", err);
      toast.error('Failed to delete page');
    } finally {
      setDeletingPageIds(prev => prev.filter(id => id !== pageId));
    }
  };

  const handleRestorePage = async (pageId) => {
    try {
      setDeletingPageIds(prev => [...prev, pageId]);
      await trashService.restorePage(workspaceId, pageId);
      setTrashedPages(prev => prev.filter(page => page.id !== pageId));
      toast.success('Page restored successfully');
    } catch (err) {
      console.error("Error restoring page:", err);
      toast.error('Failed to restore page');
    } finally {
      setDeletingPageIds(prev => prev.filter(id => id !== pageId));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchTrashedPages}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Trash2 size={24} className="text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-800">Trash</h1>
        </div>
        <button
          onClick={fetchTrashedPages}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors text-sm"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {trashedPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Trash2 size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Trash is empty</h2>
          <p className="text-gray-500">No deleted pages found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deleted At
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trashedPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{page.title || 'Untitled'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(page.deletedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleRestorePage(page.id)}
                        disabled={deletingPageIds.includes(page.id)}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handleHardDelete(page.id)}
                        disabled={deletingPageIds.includes(page.id)}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 flex items-center gap-1"
                      >
                        {deletingPageIds.includes(page.id) ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <span>Delete Forever</span>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
