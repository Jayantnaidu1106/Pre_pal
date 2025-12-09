import { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useUser } from '../context/user.context';
import AnalyticsBoard from '../components/Profile/AnalyticsBoard';
import HistoryList from '../components/Profile/HistoryList';
import ProfileCalendar from '../components/Profile/ProfileCalendar';

const Profile = () => {
    const { user } = useUser();
    const [quizHistory, setQuizHistory] = useState([]);
    const [interviewHistory, setInterviewHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizRes, interviewRes] = await Promise.all([
                    axios.get('/quiz/history'),
                    axios.get('/api/interview/my')
                ]);

                setQuizHistory(quizRes.data);
                // Handle different response structures for interviews if needed
                // Assuming interviewRes.data is the array or interviewRes.data.interviews
                setInterviewHistory(Array.isArray(interviewRes.data) ? interviewRes.data : interviewRes.data.interviews || []);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Calculate Stats
    const totalQuizzes = quizHistory.length;
    const totalInterviews = interviewHistory.length;
    const avgScore = totalQuizzes > 0
        ? Math.round(quizHistory.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizzes)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-500">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">Student</span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">Active Member</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <i className="ri-dashboard-line"></i>
                        Dashboard
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-indigo-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Quizzes</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalQuizzes}</h3>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <i className="ri-file-list-3-line text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Interviews</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalInterviews}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <i className="ri-user-voice-line text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Quiz Score</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{avgScore}%</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <i className="ri-award-line text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="space-y-6">
                    {/* Top Row: Analytics & Calendar */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        <div className="w-full h-full">
                            <AnalyticsBoard quizHistory={quizHistory} interviewHistory={interviewHistory} />
                        </div>
                        <div className="w-full h-full">
                            <ProfileCalendar quizHistory={quizHistory} interviewHistory={interviewHistory} />
                        </div>
                    </div>

                    {/* Bottom Row: History Lists */}
                    <div>
                        <HistoryList interviews={interviewHistory} quizzes={quizHistory} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
