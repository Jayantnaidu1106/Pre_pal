import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import 'remixicon/fonts/remixicon.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const features = [
        {
            icon: 'ri-team-line',
            title: 'Collaborative Study Rooms',
            description: 'Join real-time study sessions with chat, whiteboard, and file sharing capabilities.',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            borderColor: 'border-indigo-500'
        },
        {
            icon: 'ri-question-answer-line',
            title: 'AI Quiz Generator',
            description: 'Upload your study materials and let AI generate comprehensive quizzes for you.',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-500'
        },
        {
            icon: 'ri-user-voice-line',
            title: 'AI Mock Interviews',
            description: 'Practice with an AI interviewer and receive instant, personalized feedback.',
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            borderColor: 'border-orange-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <i className="ri-brain-line text-2xl text-indigo-600"></i>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                Education Ecosystem
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {isLoggedIn ? (
                                <Link
                                    to="/dashboard"
                                    className="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all hover:shadow-lg flex items-center gap-2"
                                >
                                    Go to Dashboard <i className="ri-arrow-right-line"></i>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all hover:shadow-lg"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6 inline-block">
                            🚀 Revolutionizing Online Learning
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Your All-in-One Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Smart Learning</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Elevate your education with AI-powered tools, collaborative spaces, and interactive practice sessions tailored just for you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {isLoggedIn ? (
                                <Link
                                    to="/dashboard"
                                    className="px-8 py-4 rounded-full bg-indigo-600 text-white text-lg font-bold hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2"
                                >
                                    Launch Dashboard <i className="ri-rocket-line"></i>
                                </Link>
                            ) : (
                                <Link
                                    to="/register"
                                    className="px-8 py-4 rounded-full bg-indigo-600 text-white text-lg font-bold hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2"
                                >
                                    Start Learning Now <i className="ri-arrow-right-line"></i>
                                </Link>
                            )}
                            {!isLoggedIn && (
                                <Link
                                    to="/login"
                                    className="px-8 py-4 rounded-full bg-white text-gray-700 text-lg font-bold hover:bg-gray-50 border border-gray-200 transition-all hover:scale-105 shadow-md flex items-center justify-center"
                                >
                                    Log In
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                            className={`bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-t-4 ${feature.borderColor} group`}
                        >
                            <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <i className={`${feature.icon} text-3xl ${feature.color}`}></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <i className="ri-brain-line text-xl text-indigo-600"></i>
                        <span className="text-lg font-bold text-gray-900">Education Ecosystem</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Education Ecosystem. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><i className="ri-twitter-fill text-xl"></i></a>
                        <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><i className="ri-github-fill text-xl"></i></a>
                        <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><i className="ri-linkedin-fill text-xl"></i></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
