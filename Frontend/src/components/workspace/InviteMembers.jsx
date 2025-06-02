import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, UserPlus, X, Check } from 'lucide-react';

export default function InviteMembers() {
  const { workspaceId } = useParams();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // TODO: Replace with actual API call
      console.log('Inviting:', { email, role, workspaceId });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInvites(prev => [...prev, { email, role, status: 'pending' }]);
      setEmail('');
      setMessage({ text: 'Invitation sent successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to send invitation:', error);
      setMessage({ text: 'Failed to send invitation. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite Team Members</h1>
        <p className="text-gray-600">
          Invite people to collaborate on this workspace. They'll get access to all pages and content in this workspace.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-l-md"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-3 pr-7 border-l-0 border-gray-300 bg-transparent text-gray-500 sm:text-sm rounded-r-md"
              >
                <option value="editor">Can edit</option>
                <option value="viewer">Can view</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="-ml-1 mr-2 h-4 w-4" />
                {isLoading ? 'Sending...' : 'Invite'}
              </button>
            </div>
          </div>
        </form>

        {message.text && (
          <div className={`mt-4 p-3 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}
      </div>

      {invites.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Invitations</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {invites.map((invite, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                        <div className="text-sm text-gray-500 capitalize">{invite.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                      <button className="ml-4 text-gray-400 hover:text-gray-500">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
