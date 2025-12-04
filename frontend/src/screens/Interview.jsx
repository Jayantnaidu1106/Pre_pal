import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Interview = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-orange-600">Mock Interview</h1>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-8">
            <i className="ri-user-voice-line text-8xl text-orange-600 mb-4"></i>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Mock Interview</h2>
            <p className="text-xl text-gray-600">
              Practice your interview skills with an AI-powered interviewer
            </p>
          </div>

          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-500 rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-orange-800 mb-4">
              🚧 Coming Soon! 🚧
            </h3>
            <p className="text-orange-700 text-lg mb-4">
              This module is currently under development. Soon you'll be able to:
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-orange-200 rounded-lg p-6 text-left">
              <i className="ri-robot-line text-4xl text-orange-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">AI Interviewer</h4>
              <p className="text-gray-600">
                Intelligent AI asks relevant questions based on your field
              </p>
            </div>

            <div className="border-2 border-orange-200 rounded-lg p-6 text-left">
              <i className="ri-question-answer-line text-4xl text-orange-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Market-Level Difficulty</h4>
              <p className="text-gray-600">
                Choose from Easy, Medium, or Hard difficulty levels
              </p>
            </div>

            <div className="border-2 border-orange-200 rounded-lg p-6 text-left">
              <i className="ri-feedback-line text-4xl text-orange-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Real-Time Feedback</h4>
              <p className="text-gray-600">
                Get instant feedback on your answers and communication
              </p>
            </div>

            <div className="border-2 border-orange-200 rounded-lg p-6 text-left">
              <i className="ri-history-line text-4xl text-orange-600 mb-3"></i>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Interview History</h4>
              <p className="text-gray-600">
                Review past interviews and track your improvement
              </p>
            </div>
          </div>

          {/* Mock Difficulty Selector (Disabled) */}
          <div className="border-2 border-gray-300 rounded-lg p-8 bg-gray-50 opacity-50 mb-8">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Select Difficulty Level</h3>
            <div className="flex justify-center gap-4 mb-6">
              <button
                disabled
                className="px-8 py-3 border-2 border-green-300 rounded-lg bg-white cursor-not-allowed"
              >
                <i className="ri-seedling-line text-2xl text-green-600"></i>
                <div className="font-bold">Easy</div>
              </button>
              <button
                disabled
                className="px-8 py-3 border-2 border-orange-300 rounded-lg bg-white cursor-not-allowed"
              >
                <i className="ri-fire-line text-2xl text-orange-600"></i>
                <div className="font-bold">Medium</div>
              </button>
              <button
                disabled
                className="px-8 py-3 border-2 border-red-300 rounded-lg bg-white cursor-not-allowed"
              >
                <i className="ri-sword-line text-2xl text-red-600"></i>
                <div className="font-bold">Hard</div>
              </button>
            </div>
            <button 
              disabled
              className="bg-gray-400 text-white px-8 py-4 rounded-lg cursor-not-allowed text-lg font-bold"
            >
              Start Interview (Coming Soon)
            </button>
          </div>

          {/* Interview Types */}
          <div className="text-left mb-8">
            <h4 className="font-bold text-gray-900 mb-4 text-center">Planned Interview Categories:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <i className="ri-code-line text-3xl text-orange-600 mb-2"></i>
                <div className="font-semibold">Technical</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <i className="ri-user-heart-line text-3xl text-orange-600 mb-2"></i>
                <div className="font-semibold">HR</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <i className="ri-team-line text-3xl text-orange-600 mb-2"></i>
                <div className="font-semibold">Behavioral</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <i className="ri-briefcase-line text-3xl text-orange-600 mb-2"></i>
                <div className="font-semibold">Case Study</div>
              </div>
            </div>
          </div>

          {/* Tech Stack Info */}
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-3">Planned Technology Stack:</h4>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white px-4 py-2 rounded-full border border-orange-300">OpenAI GPT-4</span>
              <span className="bg-white px-4 py-2 rounded-full border border-orange-300">Speech Recognition</span>
              <span className="bg-white px-4 py-2 rounded-full border border-orange-300">NLP Analysis</span>
              <span className="bg-white px-4 py-2 rounded-full border border-orange-300">Performance Scoring</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Interview;
