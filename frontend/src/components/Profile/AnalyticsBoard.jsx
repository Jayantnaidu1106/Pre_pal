import { useMemo, useState } from 'react';

const AnalyticsBoard = ({ quizHistory, interviewHistory = [] }) => {
    const [viewMode, setViewMode] = useState('quizzes'); // 'quizzes' or 'interviews'
    const [filter, setFilter] = useState('all'); // 'all', 'last5', 'last10'
    const [selectedSubject, setSelectedSubject] = useState('All Subjects');
    const [selectedAttribute, setSelectedAttribute] = useState('overall'); // 'overall', 'technical', 'communication', 'problem_solving', 'confidence'

    // Extract unique subjects for Quizzes
    const subjects = useMemo(() => {
        const unique = new Set(quizHistory.map(q => q.topic || 'General').map(s => s.trim()));
        return ['All Subjects', ...Array.from(unique)];
    }, [quizHistory]);

    // Chart Data Generation
    const chartData = useMemo(() => {
        let rawData = [];

        if (viewMode === 'quizzes') {
            // --- QUIZ LOGIC ---
            let filtered = quizHistory;
            if (selectedSubject !== 'All Subjects') {
                filtered = quizHistory.filter(q => (q.topic || 'General').trim() === selectedSubject);
            }
            // Sort by date
            rawData = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            // --- INTERVIEW LOGIC ---
            // Sort by date first
            rawData = [...interviewHistory].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        // Apply Time Filter (Common)
        if (filter === 'last5') {
            rawData = rawData.slice(-5);
        } else if (filter === 'last10') {
            rawData = rawData.slice(-10);
        }

        // Map to Coordinate Data
        return rawData.map((item, index) => {
            let value = 0;
            let date = item.createdAt;

            if (viewMode === 'quizzes') {
                value = item.percentage;
            } else {
                // Extract Interview Score based on attribute
                if (!item.feedback) {
                    value = 0;
                } else if (selectedAttribute === 'overall') {
                    value = (item.feedback.rating || 0) * 10; // Scale 0-10 to 0-100%
                } else {
                    // Access deep metrics safely
                    const metrics = item.feedback.metrics || {};
                    let metricScore = 0;

                    switch (selectedAttribute) {
                        case 'technical': metricScore = metrics.technicalKnowledge?.score || 0; break;
                        case 'communication': metricScore = metrics.communicationSkills?.score || 0; break;
                        case 'problem_solving': metricScore = metrics.problemSolvingApproach?.score || 0; break;
                        case 'confidence': metricScore = metrics.confidence?.score || 0; break;
                        default: metricScore = 0;
                    }
                    value = metricScore * 10; // Scale 0-10 to 0-100%
                }
            }

            return {
                ...item,
                index: index,
                value: value, // Normalized to 0-100 scale
                displayValue: viewMode === 'quizzes' ? `${value}%` : `${value / 10}/10` // Formatted label
            };
        });
    }, [quizHistory, interviewHistory, viewMode, filter, selectedSubject, selectedAttribute]);

    // Calculate Stats
    const currentAvg = useMemo(() => {
        if (!chartData.length) return 0;
        const total = chartData.reduce((acc, curr) => acc + curr.value, 0); // Sum of 0-100 values
        return Math.round(total / chartData.length);
    }, [chartData]);


    const hasData = chartData.length > 0;

    // --- CHART SCALING ---
    const height = 100;
    const paddingY = 20;
    const usableHeight = height - (paddingY * 2);

    const getY = (percentage) => {
        return (height - paddingY) - (percentage / 100) * usableHeight;
    };

    const getX = (index) => {
        if (chartData.length <= 1) return 50;
        return (index / (chartData.length - 1)) * 100;
    };

    const points = chartData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
            {/* Header / Controls */}
            <div className="flex flex-col gap-6 mb-8 border-b border-gray-100 pb-6">

                {/* Title and View Toggles */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${viewMode === 'quizzes' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                            <i className={`text-xl ${viewMode === 'quizzes' ? 'ri-line-chart-line' : 'ri-user-voice-line'}`}></i>
                        </div>
                        {viewMode === 'quizzes' ? 'Quiz Performance' : 'Interview Progress'}
                    </h3>

                    {/* View Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
                        <button
                            onClick={() => setViewMode('quizzes')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'quizzes' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Quizzes
                        </button>
                        <button
                            onClick={() => setViewMode('interviews')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'interviews' ? 'bg-white text-purple-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Interviews
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">

                    {/* Left: Specific Filters based on Mode */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {viewMode === 'quizzes' ? (
                            <div className="relative w-full md:w-48">
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none focus:border-indigo-500 hover:bg-white transition-colors cursor-pointer"
                                >
                                    {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                </select>
                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                            </div>
                        ) : (
                            <div className="relative w-full md:w-48">
                                <select
                                    value={selectedAttribute}
                                    onChange={(e) => setSelectedAttribute(e.target.value)}
                                    className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-purple-50 text-purple-700 outline-none focus:border-purple-500 hover:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="overall">Overall Rating</option>
                                    <option value="technical">Technical Knowledge</option>
                                    <option value="communication">Communication</option>
                                    <option value="problem_solving">Problem Solving</option>
                                    <option value="confidence">Confidence</option>
                                </select>
                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none"></i>
                            </div>
                        )}
                    </div>

                    {/* Right: Time Filter */}
                    <div className="flex bg-gray-100 p-1 rounded-lg ml-auto">
                        {[{ id: 'last5', label: 'Last 5' }, { id: 'last10', label: 'Last 10' }, { id: 'all', label: 'All' }].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filter === btn.id ? 'bg-white text-gray-900 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CHART DISPLAY */}
            {!hasData ? (
                <div className="h-96 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <i className="ri-bar-chart-groupped-line text-4xl mb-2 opacity-50"></i>
                    <p className="text-sm">No {viewMode} data available.</p>
                </div>
            ) : (
                <div className="relative h-96 w-full px-2">
                    <div className="absolute inset-x-4 inset-y-4">
                        {/* Grid */}
                        <div className="absolute inset-0 flex flex-col justify-between text-gray-200">
                            {[0, 1, 2, 3, 4].map((_, i) => <div key={i} className="border-b border-dashed border-gray-100 w-full h-0"></div>)}
                        </div>

                        {/* Y-Axis Labels (Dynamic based on mode) */}
                        <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 font-medium">
                            {viewMode === 'quizzes'
                                ? ['100%', '75%', '50%', '25%', '0%'].map(l => <span key={l}>{l}</span>)
                                : ['10', '7.5', '5', '2.5', '0'].map(l => <span key={l}>{l}</span>)
                            }
                        </div>

                        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={viewMode === 'quizzes' ? '#4f46e5' : '#9333ea'} stopOpacity="0.5" />
                                    <stop offset="100%" stopColor={viewMode === 'quizzes' ? '#4f46e5' : '#9333ea'} stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            <polygon
                                points={`${points} ${getX(chartData.length - 1)},100 ${getX(0)},100`}
                                fill="url(#chartGradient)"
                                className="transition-all duration-500 ease-out"
                            />
                            <polyline
                                points={points}
                                fill="none"
                                stroke={viewMode === 'quizzes' ? '#4f46e5' : '#9333ea'}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-500 ease-out"
                                vectorEffect="non-scaling-stroke"
                            />
                            {chartData.map((d, i) => (
                                <g key={i} className="group cursor-pointer">
                                    <circle
                                        cx={getX(i)}
                                        cy={getY(d.value)}
                                        r="1.5"
                                        fill="white"
                                        stroke={viewMode === 'quizzes' ? '#4f46e5' : '#9333ea'}
                                        strokeWidth="0.5"
                                        vectorEffect="non-scaling-stroke"
                                        className="transition-all duration-300 group-hover:r-2 group-hover:stroke-2"
                                    />
                                    <g className="opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                        <foreignObject x={getX(i) - 30} y={getY(d.value) - 35} width="60" height="30">
                                            <div className="bg-gray-900 text-white text-center rounded-lg py-1 px-2 text-[10px] shadow-lg transform -translate-y-1">
                                                <div className="font-bold">{d.displayValue}</div>
                                                <div className="text-gray-400 text-[8px] whitespace-nowrap">
                                                    {new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </foreignObject>
                                    </g>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${viewMode === 'quizzes' ? 'bg-indigo-600' : 'bg-purple-600'}`}></span>
                    <span className="font-medium">{viewMode === 'quizzes' ? 'Quiz Score' : selectedAttribute.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span>Average: <strong className="text-gray-700">{viewMode === 'quizzes' ? `${currentAvg}%` : `${currentAvg / 10}/10`}</strong></span>
            </div>
        </div>
    );
};

export default AnalyticsBoard;
