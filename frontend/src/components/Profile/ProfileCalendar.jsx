import { useMemo, useState } from 'react';

const ProfileCalendar = ({ quizHistory = [], interviewHistory = [] }) => {
    const [isDarkMode, setIsDarkMode] = useState(false); // Theme Toggle State
    const [currentDate, setCurrentDate] = useState(new Date()); // For Monthly Calendar

    // --- DATA PROCESSING (Shared) ---
    const { activityMap, totalSubmissions, activeDays, maxStreak } = useMemo(() => {
        const map = new Map();
        let total = 0;

        const addActivity = (dateStr) => {
            const date = new Date(dateStr).toDateString();
            map.set(date, (map.get(date) || 0) + 1);
            total++;
        };

        quizHistory.forEach(q => addActivity(q.createdAt));
        interviewHistory.forEach(i => addActivity(i.createdAt));

        const dates = Array.from(map.keys()).map(d => new Date(d)).sort((a, b) => a - b);
        const activeCount = dates.length;

        let currentStreak = 0;
        let maxStr = 0;
        let prevDate = null;

        dates.forEach(date => {
            if (prevDate) {
                const diffTime = Math.abs(date - prevDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) currentStreak++;
                else currentStreak = 1;
            } else currentStreak = 1;

            if (currentStreak > maxStr) maxStr = currentStreak;
            prevDate = date;
        });

        return { activityMap: map, totalSubmissions: total, activeDays: activeCount, maxStreak: maxStr };
    }, [quizHistory, interviewHistory]);

    // --- HEATMAP LOGIC ---
    const calendarData = useMemo(() => {
        const today = new Date();
        const days = [];
        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateString = d.toDateString();
            const count = activityMap.get(dateString) || 0;
            let level = 0;
            if (count >= 5) level = 4;
            else if (count >= 3) level = 3;
            else if (count >= 2) level = 2;
            else if (count >= 1) level = 1;
            days.push({ date: d, dateString, count, level });
        }
        return days;
    }, [activityMap]);

    const { weeks, monthLabels } = useMemo(() => {
        const weeksArray = [];
        let currentWeek = [];
        const months = [];
        const startDay = calendarData[0].date.getDay();

        for (let i = 0; i < startDay; i++) currentWeek.push(null);

        calendarData.forEach(day => {
            if (day.date.getDate() === 1) {
                months.push({ name: day.date.toLocaleDateString(undefined, { month: 'short' }), weekIndex: weeksArray.length });
            }
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        });
        if (currentWeek.length > 0) weeksArray.push(currentWeek);
        return { weeks: weeksArray, monthLabels: months };
    }, [calendarData]);

    // --- MONTHLY CALENDAR LOGIC ---
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const renderMonthlyCells = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const cells = [];

        for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="h-8"></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateString = dateObj.toDateString();
            const count = activityMap.get(dateString) || 0;
            const isToday = new Date().toDateString() === dateString;
            const isActive = count > 0;

            cells.push(
                <div key={day} className="relative h-8 flex items-center justify-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                        ${isActive
                            ? (isDarkMode ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-green-100 text-green-700 border border-green-200 font-bold')
                            : (isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')}
                        ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                    `}>
                        {day}
                    </div>
                </div>
            );
        }
        return cells;
    };

    // --- RENDER HELPERS ---
    const getHeatmapColor = (level) => {
        if (isDarkMode) {
            switch (level) {
                case 4: return 'bg-green-600';
                case 3: return 'bg-green-700';
                case 2: return 'bg-green-800';
                case 1: return 'bg-green-900';
                default: return 'bg-gray-800';
            }
        }
        switch (level) {
            case 4: return 'bg-green-700';
            case 3: return 'bg-green-500';
            case 2: return 'bg-green-400';
            case 1: return 'bg-green-200';
            default: return 'bg-gray-100';
        }
    };

    const containerClass = isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-600';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className={`rounded-xl shadow-sm border p-6 h-full flex flex-col transition-colors duration-300 ${containerClass}`}>

            {/* Header with Stats & Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className={`font-medium text-lg ${textClass}`}>
                        <span className="font-bold">{totalSubmissions}</span> submissions in the past year
                    </h3>
                </div>
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex flex-col items-end">
                        <span className={`${subTextClass} text-xs uppercase tracking-wide`}>Total active days</span>
                        <span className={`font-bold ${textClass}`}>{activeDays}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`${subTextClass} text-xs uppercase tracking-wide`}>Max streak</span>
                        <span className={`font-bold ${textClass}`}>{maxStreak}</span>
                    </div>
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        <i className={isDarkMode ? "ri-sun-line" : "ri-moon-line"}></i>
                    </button>
                </div>
            </div>

            {/* --- SECTION 1: HEATMAP --- */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar mb-6 border-b border-gray-100/10">
                <div className="min-w-max">
                    {/* Month Labels */}
                    <div className={`flex mb-2 text-xs ${subTextClass} relative h-4`}>
                        {monthLabels.map((m, i) => (
                            <div key={i} className="absolute" style={{ left: `${m.weekIndex * 15}px` }}>{m.name}</div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {/* Day Labels */}
                        <div className={`flex flex-col gap-1 text-[10px] ${subTextClass} h-[98px] justify-between pt-4 pb-2 mr-1`}>
                            <span>Mon</span><span>Wed</span><span>Fri</span>
                        </div>
                        {/* Grid */}
                        <div className="flex gap-1">
                            {weeks.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-col gap-1">
                                    {week.map((day, dIndex) => (
                                        day ? (
                                            <div key={day.dateString} className={`w-2.5 h-2.5 rounded-sm ${getHeatmapColor(day.level)} relative group cursor-pointer`}>
                                                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 ${isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'} text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap`}>
                                                    <strong>{day.count} submissions</strong> on {day.date.toLocaleDateString()}
                                                </div>
                                            </div>
                                        ) : <div key={`empty-${wIndex}-${dIndex}`} className="w-2.5 h-2.5 bg-transparent"></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: MONTHLY CALENDAR --- */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-md font-bold flex items-center gap-2 ${textClass}`}>
                        <i className="ri-calendar-line text-indigo-500"></i> Monthly View
                    </h3>
                    <div className={`flex items-center gap-4 text-sm font-semibold ${textClass}`}>
                        <button onClick={handlePrevMonth} className="hover:text-indigo-500 p-1"><i className="ri-arrow-left-s-line text-lg"></i></button>
                        <span>{monthNames[month]} {year}</span>
                        <button onClick={handleNextMonth} className="hover:text-indigo-500 p-1"><i className="ri-arrow-right-s-line text-lg"></i></button>
                    </div>
                </div>

                <div className={`grid grid-cols-7 gap-1 text-center mb-2 text-xs font-bold uppercase ${subTextClass}`}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {renderMonthlyCells()}
                </div>
            </div>

        </div>
    );
};

export default ProfileCalendar;
