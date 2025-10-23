import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/axios';
import 'remixicon/fonts/remixicon.css';
import { intializeSocket, recieveMessage, sendMessage } from '../config/socket';
import { useUser } from '../context/user.context';
import Markdown from 'markdown-to-jsx';

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const { user, setUser } = useUser();

  useEffect(() => {
    // Initialize socket when project is available
    if (project?._id) {
      intializeSocket(project._id);

      // Set up message listener
      recieveMessage('project-message', (data) => {
        setMessages(prev => [...prev, { ...data, isOwn: false, id: Date.now() }]);
      });
    }
  }, [project]);

  useEffect(() => {
    // Fetch all users for project management
    const fetchAllUsers = async () => {
      try {
        const response = await api.get('/users/all');
        setAllUsers(response.data.allUsers || []);
      } catch (err) {
        setError('Failed to fetch users: ' + (err.response?.data?.error || err.message));
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    // Validate authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) return navigate('/login');
    if (userData) setUser(JSON.parse(userData));

    // Load project data
    if (id) {
      fetchProject();
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProject = async () => {
    // Fetch project details
    try {
      const response = await api.get(`/project/get-project/${id}`);
      setProject(response.data.project);
    } catch (err) {
      setError('Failed to fetch project: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      message: newMessage,
      sender: user?._id,
      projectId: project?._id,
      timestamp: new Date(),
      user: user
    };

    sendMessage('project-message', messageData);

    // Add to local messages for immediate display
    setMessages(prev => [...prev, {
      ...messageData,
      isOwn: true,
      id: Date.now()
    }]);

    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddCollaborators = async () => {
    if (selectedUserIds.length === 0) {
      setError('Please select at least one user to add');
      return;
    }

    try {
      const response = await api.put('/project/add-user', {
        projectId: id,
        users: selectedUserIds
      });

      // Update the project with new collaborators
      setProject(response.data.project);
      setSelectedUserIds([]);
      setShowUserModal(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add collaborators');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden relative font-sans">

      {/* 💬 Chat Section */}
      <div className="w-full md:w-1/3 bg-[#f7f2f2] flex flex-col justify-between border-r border-gray-300">
        {/* Top Bar */}
        <div className="bg-[#9e7676] p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowUserModal(true)}>
              <i className="ri-user-add-line text-black text-2xl cursor-pointer hover:text-white">
                <span className="ml-2 text-lg">Add Collaborator</span>
              </i>
            </button>

            {/* Collaborator Count Badge */}
            {project && (
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">
                  {project.users?.length || 0} collaborator{project.users?.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <button onClick={() => navigate('/')}>
            <i className="ri-home-line text-black text-2xl cursor-pointer hover:text-white"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isOwn ? 'items-end text-right' : 'items-start'}`}
            >
              <span className="text-xs text-gray-600">{msg.user.email}</span>
              <div
                className={`px-3 py-2 rounded-lg max-w-[80%] text-sm shadow ${
                  msg.isOwn ? 'bg-[#d1c4e9]' : 'bg-[#c8e6c9]'
                }`}
              >
                {/* Check if message is from AI and render as markdown */}
                {msg.user.email === 'ai@example.com' ? (
                  <Markdown
                    options={{
                      wrapper: 'div',
                      forceWrapper: true,
                      overrides: {
                        p: {
                          props: {
                            style: { margin: '0.5em 0' }
                          }
                        },
                        code: {
                          props: {
                            style: {
                              backgroundColor: '#f4f4f4',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              fontSize: '0.9em'
                            }
                          }
                        },
                        pre: {
                          props: {
                            style: {
                              backgroundColor: '#f4f4f4',
                              padding: '10px',
                              borderRadius: '5px',
                              overflow: 'auto',
                              fontSize: '0.9em'
                            }
                          }
                        }
                      }
                    }}
                  >
                    {msg.message}
                  </Markdown>
                ) : (
                  msg.message
                )}
                <div className="text-[10px] text-gray-500 mt-1">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="bg-[#d1d1d1] p-4 flex items-center border-t">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-md border border-gray-400 bg-white focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 px-4 py-2 bg-[#9e7676] text-white rounded-md hover:bg-[#825f5f]"
          >
            Send
          </button>
        </div>
      </div>

      {/* Placeholder Panel */}
      <div className="hidden md:flex flex-1 bg-[#e4e5e7]"></div>

      {/* 👥 Multi-User Selection Modal */}
      <AnimatePresence>
        {showUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
          >
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Select Collaborators</h2>
                <button onClick={() => setShowUserModal(false)}>
                  <i className="ri-close-line text-xl text-gray-600 hover:text-black"></i>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                  <div className="text-red-700 text-sm">{error}</div>
                </div>
              )}

              {/* User List */}
              <div className="max-h-72 overflow-y-auto divide-y">
                {allUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No users available to add
                  </div>
                ) : (
                  allUsers.map((u) => {
                    const isSelected = selectedUserIds.includes(u._id);
                    return (
                      <div
                        key={u._id}
                        onClick={() => toggleUserSelection(u._id)}
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 ${
                          isSelected ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{u.email}</p>
                          <p className="text-xs text-gray-500">Available to add</p>
                        </div>
                        <input
                          type="checkbox"
                          readOnly
                          checked={isSelected}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Confirm Button */}
              <div className="p-4 border-t flex justify-between">
                <div className="text-sm text-gray-600">
                  {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCollaborators}
                    disabled={selectedUserIds.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Collaborators
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Project;
