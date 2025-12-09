import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const QuizResultView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await axios.get(`/quiz/result/${id}`);
                setQuizResult(response.data);
            } catch (err) {
                console.error('Error fetching quiz result:', err);
                setError('Failed to load quiz details.');
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !quizResult) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-red-500 text-lg font-semibold mb-4">{error || 'Result not found'}</div>
                <button
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Back to Profile
                </button>
            </div>
        );
    }

    const { score, totalQuestions, percentage, quizData, topic } = quizResult;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <i className="ri-arrow-left-line"></i> Back to Profile
                    </button>
                    <div className="text-sm text-gray-500">
                        {new Date(quizResult.createdAt).toLocaleDateString()}
                    </div>
                </div>

                {/* Score Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className={`px-8 py-10 text-center text-white
                        ${percentage >= 60 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-orange-600'}`}>
                        <h1 className="text-3xl font-bold mb-2">{topic}</h1>
                        <p className="text-white/90 text-lg mb-6">Quiz Result</p>

                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full border-4 border-white/30 text-3xl font-bold backdrop-blur-sm">
                            {percentage}%
                        </div>
                        <div className="mt-4 text-white/90 font-medium">
                            You scored {score} out of {totalQuestions}
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                    {quizData && quizData.map((q, index) => {
                        // Backend might not store user's selected answer if we didn't save it explicitly in quizData
                        // Let's assume quizData stores objects like { question, options, answer (correct), userAnswer (if applicable) }
                        // If 'userAnswer' is missing in historical data, we can't show it, but new ones should have it.
                        // Wait, previous implementation of saveQuiz just passed `quiz` array which had `question`, `options`, `answer`.
                        // It did NOT have `selectedAnswers` merged into it. 
                        // I need to update the Quiz.jsx save logic first to include user answers if I truly want to show them.
                        // For now, I will display the question and the CORRECT answer.

                        return (
                            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                                        {index + 1}
                                    </span>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 text-lg mb-4">{q.question}</p>

                                        <div className="space-y-2">
                                            {q.options.map((opt, i) => {
                                                const isCorrect = opt === q.answer;
                                                // Since we don't have userAnswer in the current schema yet (unless I update it), 
                                                // I will highlight the correct answer Green.

                                                let styleClass = "border-gray-200 text-gray-600 bg-gray-50";
                                                if (isCorrect) {
                                                    styleClass = "border-green-300 text-green-700 bg-green-50 font-medium";
                                                }

                                                return (
                                                    <div key={i} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${styleClass}`}>
                                                        <span>{opt}</span>
                                                        {isCorrect && <i className="ri-checkbox-circle-line text-lg text-green-600"></i>}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 text-xs text-gray-500 italic">
                                            * Detailed user answer tracking will be available for future quizzes.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default QuizResultView;
