import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HistoryList = ({ interviews, quizzes }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('quizzes');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('quizzes')}
                    className={`flex-1 py-4 text-center font-semibold transition-colors
            ${activeTab === 'quizzes' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <i className="ri-file-list-3-line mr-2"></i>
                    Quizzes ({quizzes.length})
                </button>
                <button
                    onClick={() => setActiveTab('interviews')}
                    className={`flex-1 py-4 text-center font-semibold transition-colors
            ${activeTab === 'interviews' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <i className="ri-user-voice-line mr-2"></i>
                    Interviews ({interviews.length})
                </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {activeTab === 'quizzes' && (
                    <div className="divide-y divide-gray-100">
                        {quizzes.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No quizzes taken yet.</div>
                        ) : (
                            quizzes.map((quiz) => (
                                <div key={quiz._id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                        ${quiz.percentage >= 80 ? 'bg-green-100 text-green-700' :
                                                quiz.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {quiz.percentage}%
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 line-clamp-1">{quiz.title || quiz.topic}</h4>
                                            <p className="text-xs text-gray-500">
                                                {new Date(quiz.createdAt).toLocaleDateString()} • {quiz.score}/{quiz.totalQuestions} Correct
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/quiz/result/${quiz._id}`)}
                                            className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                        >
                                            View Result
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'interviews' && (
                    <div className="divide-y divide-gray-100">
                        {interviews.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No mock interviews yet.</div>
                        ) : (
                            interviews.map((interview) => (
                                <div key={interview._id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                            <i className="ri-briefcase-line text-lg"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{interview.title}</h4>
                                            <p className="text-xs text-gray-500">
                                                {new Date(interview.createdAt).toLocaleDateString()} • {interview.status}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/mock-interview/feedback/${interview._id}`)}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                                    >
                                        View Details <i className="ri-arrow-right-s-line"></i>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryList;
