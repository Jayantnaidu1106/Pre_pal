import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/project/all');
      console.log('Projects response:', response.data);
      setProjects(response.data.allUserProjects || []);
    } catch (err) {
      setError('Failed to fetch projects: ' + (err.response?.data?.error || err.message));
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = () => {
    setShowNameModal(true);
    setProjectName('');
    setError('');
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    try {
      setCreatingProject(true);
      setError(''); // Clear any previous errors

      // Create a new project with the user-provided name
      const response = await api.post('/project/create', {
        name: projectName.trim()
      });

      console.log('New project created:', response.data);

      // Navigate to the newly created project
      if (response.data.newProject && response.data.newProject._id) {
        setShowNameModal(false);
        navigate(`/project/${response.data.newProject._id}`);
      } else {
        setError('Failed to create project: Invalid response from server');
      }
    } catch (err) {
      console.error('Error creating new project:', err);
      setError('Failed to create new project: ' + (err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message));
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCancelCreate = () => {
    setShowNameModal(false);
    setProjectName('');
    setError('');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.email || 'User'}
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Action Buttons */}
          <div className="mb-8 flex space-x-4">
            <button
              onClick={handleNewProject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
            >
              + New Project
            </button>
            {/* <button
              onClick={() => navigate('/socket-test')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
            >
              🔌 Socket.IO Test
            </button> */}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Projects List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Projects
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Click on a project to view and edit it.
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                No projects yet. Create your first project!
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <li key={project._id}>
                    <div
                      onClick={() => handleProjectClick(project._id)}
                      className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-indigo-600 truncate">
                            {project.name || 'Untitled Project'}
                          </h4>
                          {/* <p className="text-sm text-gray-500 mt-1">
                            Project ID: {project._id}
                          </p> */}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">
                              {project.users?.length || 0}
                            </span>{' '}
                            collaborator{project.users?.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-indigo-600">
                            →
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* New Project Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={handleCancelCreate}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Error Display */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creatingProject) {
                      handleCreateProject();
                    }
                  }}
                  placeholder="Enter project name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button
                onClick={handleCancelCreate}
                disabled={creatingProject}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={creatingProject || !projectName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {creatingProject ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;