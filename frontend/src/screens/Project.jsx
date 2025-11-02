import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/axios';
import 'remixicon/fonts/remixicon.css';
import { intializeSocket, recieveMessage, sendMessage } from '../config/socket';
import { useUser } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import Whiteboard from '../components/Whiteboard';

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
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const socketInitialized = useRef(false);

  useEffect(() => {
    // Initialize socket when project is available (only once)
    if (project?._id && !socketInitialized.current) {
      intializeSocket(project._id);
      socketInitialized.current = true;

      // Set up message listener
      recieveMessage('project-message', (data) => {
        console.log('Received message:', data);
        // Add message if it's from another user OR from AI
        if (data.sender !== user?._id || data.sender === 'ai') {
          setMessages(prev => [...prev, { 
            ...data, 
            isOwn: data.sender === user?._id && data.sender !== 'ai', 
            id: Date.now() + Math.random() 
          }]);
        }
      });
    }
  }, [project, user]);

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

    // Add to local messages for immediate display
    setMessages(prev => [...prev, {
      ...messageData,
      isOwn: true,
      id: Date.now() + Math.random()
    }]);

    // Send to server (will be broadcasted to other users only)
    sendMessage('project-message', messageData);

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
      <div className={`${showWhiteboard ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 bg-[#f7f2f2] flex-col justify-between border-r border-gray-300`}>
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

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowWhiteboard(!showWhiteboard)}
              className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-2 rounded hover:bg-opacity-30 transition"
              title={showWhiteboard ? 'Hide Whiteboard' : 'Show Whiteboard'}
            >
              <i className={`${showWhiteboard ? 'ri-chat-3-line' : 'ri-pencil-ruler-2-line'} text-black text-xl`}></i>
              <span className="text-white text-sm font-medium hidden md:inline">
                {showWhiteboard ? 'Chat' : 'Whiteboard'}
              </span>
            </button>

            <button onClick={() => navigate('/')}>
              <i className="ri-home-line text-black text-2xl cursor-pointer hover:text-white"></i>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => {
            const isAI = msg.user?.email === 'ai@example.com';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isOwn ? 'items-end text-right' : 'items-start'}`}
              >
                <span className={`text-xs font-medium ${isAI ? 'text-blue-600' : 'text-gray-600'} flex items-center gap-1`}>
                  {isAI && <i className="ri-robot-line"></i>}
                  {msg.user?.email || 'Unknown'}
                </span>
                <div
                  className={`px-4 py-3 rounded-lg max-w-[80%] text-sm shadow-md ${
                    isAI 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
                      : msg.isOwn 
                        ? 'bg-[#d1c4e9]' 
                        : 'bg-[#c8e6c9]'
                  }`}
                >
                  {/* Check if message is from AI and render as markdown */}
                  {isAI ? (
                    <Markdown
                      options={{
                        wrapper: 'div',
                        forceWrapper: true,
                        overrides: {
                          p: {
                            props: {
                              style: { margin: '0.5em 0', color: '#1e40af' }
                            }
                          },
                          code: {
                            props: {
                              style: {
                                backgroundColor: '#dbeafe',
                                color: '#1e3a8a',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.9em',
                                fontFamily: 'monospace'
                              }
                            }
                          },
                          pre: {
                            props: {
                              style: {
                                backgroundColor: '#1e293b',
                                color: '#e2e8f0',
                                padding: '12px',
                                borderRadius: '6px',
                                overflow: 'auto',
                                fontSize: '0.85em',
                                fontFamily: 'monospace'
                              }
                            }
                          },
                          h1: {
                            props: {
                              style: { fontSize: '1.2em', fontWeight: 'bold', margin: '0.5em 0', color: '#1e40af' }
                            }
                          },
                          h2: {
                            props: {
                              style: { fontSize: '1.1em', fontWeight: 'bold', margin: '0.4em 0', color: '#1e40af' }
                            }
                          },
                          h3: {
                            props: {
                              style: { fontSize: '1em', fontWeight: 'bold', margin: '0.3em 0', color: '#1e40af' }
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
            );
          })}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="bg-[#d1d1d1] p-4 border-t">
          <div className="flex items-center gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              type="text"
              placeholder="Type your message... (Use @ai for AI help)"
              className="flex-1 p-2 rounded-md border border-gray-400 bg-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-[#9e7676] text-white rounded-md hover:bg-[#825f5f] transition-colors"
            >
              Send
            </button>
          </div>
          {newMessage.includes('@ai') && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <i className="ri-robot-line"></i>
              <span>AI will respond to your message</span>
            </div>
          )}
        </div>
      </div>

      {/* Whiteboard or Placeholder Panel */}
      <div className={`${showWhiteboard ? 'flex' : 'hidden md:flex'} flex-1 bg-[#e4e5e7]`}>
        {showWhiteboard && project ? (
          <Whiteboard 
            projectId={project._id} 
            isVisible={showWhiteboard}
            onClose={() => setShowWhiteboard(false)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <i className="ri-pencil-ruler-2-line text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 text-lg">Click "Whiteboard" to start collaborating</p>
            </div>
          </div>
        )}
      </div>

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
