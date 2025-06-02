import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  LayoutTemplate, 
  Plus, 
  Star, 
  Clock, 
  ListTodo, 
  BookOpen, 
  Lightbulb, 
  Calendar, 
  Users,
  ArrowRight
} from 'lucide-react';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Hardcoded templates data
  const templates = {
    all: [
      {
        id: 'blank',
        title: 'Blank',
        description: 'Start with a blank page',
        icon: <FileText className="text-blue-500" size={24} />,
        category: 'blank',
        isPopular: false
      },
      {
        id: 'meeting-notes',
        title: 'Meeting Notes',
        description: 'Organize your meeting notes and action items',
        icon: <Users className="text-purple-500" size={24} />,
        category: 'productivity',
        isPopular: true
      },
      {
        id: 'task-list',
        title: 'Task List',
        description: 'Track tasks with status and due dates',
        icon: <ListTodo className="text-green-500" size={24} />,
        category: 'productivity',
        isPopular: true
      },
      {
        id: 'project-wiki',
        title: 'Project Wiki',
        description: 'Document your project details and resources',
        icon: <BookOpen className="text-yellow-500" size={24} />,
        category: 'documentation',
        isPopular: false
      },
      {
        id: 'brainstorm',
        title: 'Brainstorm',
        description: 'Organize your thoughts and ideas',
        icon: <Lightbulb className="text-orange-500" size={24} />,
        category: 'brainstorming',
        isPopular: false
      },
      {
        id: 'content-calendar',
        title: 'Content Calendar',
        description: 'Plan and schedule your content',
        icon: <Calendar className="text-pink-500" size={24} />,
        category: 'planning',
        isPopular: true
      },
      {
        id: 'weekly-planner',
        title: 'Weekly Planner',
        description: 'Plan your week with daily to-dos',
        icon: <Clock className="text-blue-400" size={24} />,
        category: 'planning',
        isPopular: false
      },
      {
        id: 'product-roadmap',
        title: 'Product Roadmap',
        description: 'Plan your product development timeline',
        icon: <LayoutTemplate className="text-purple-400" size={24} />,
        category: 'planning',
        isPopular: true
      }
    ]
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'planning', name: 'Planning' },
    { id: 'documentation', name: 'Documentation' },
    { id: 'brainstorming', name: 'Brainstorming' },
    { id: 'blank', name: 'Blank' }
  ];

  const filteredTemplates = templates.all.filter(template => {
    const matchesCategory = activeTab === 'all' || template.category === activeTab;
    const matchesSearch = searchQuery === '' || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularTemplates = templates.all.filter(template => 
    template.isPopular && 
    (searchQuery === '' || 
     template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUseTemplate = (templateId) => {
    // In a real app, this would create a new page using the template
    console.log(`Using template: ${templateId}`);
    // For now, just show a success message
    alert(`Creating new page from template: ${templateId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Templates</h1>
        <p className="text-gray-600 mb-6">Get started with a template or create a blank page</p>
        
        {/* Search Box */}
        <div className="relative max-w-2xl mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeTab === category.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Popular Templates */}
      {activeTab === 'all' && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="text-yellow-500 mr-2" size={20} />
            Popular Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {popularTemplates.map((template) => (
              <div 
                key={template.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleUseTemplate(template.id)}
              >
                <div className="flex items-start mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    {template.icon}
                  </div>
                  <h3 className="font-medium text-gray-900">{template.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Template</span>
                  <button 
                    className="text-blue-600 text-sm font-medium flex items-center hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template.id);
                    }}
                  >
                    Use this
                    <ArrowRight className="ml-1" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {activeTab === 'all' ? 'All Templates' : categories.find(c => c.id === activeTab)?.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleUseTemplate(template.id)}
            >
              <div className="flex items-start mb-3">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  {template.icon}
                </div>
                <h3 className="font-medium text-gray-900">{template.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                </span>
                <button 
                  className="text-blue-600 text-sm font-medium flex items-center hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(template.id);
                  }}
                >
                  Use this
                  <ArrowRight className="ml-1" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
