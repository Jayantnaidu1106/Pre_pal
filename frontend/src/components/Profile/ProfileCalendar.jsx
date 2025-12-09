import { useState, useMemo } from 'react';

const ProfileCalendar = ({ quizHistory, interviewHistory }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper to check if a date has activity
    const activeDays = useMemo(() => {
        const dates = new Set();
        const normalizeDate = (d) => new Date(d).toDateString();

        quizHistory.forEach(q => dates.add(normalizeDate(q.createdAt)));
        interviewHistory.forEach(i => dates.add(normalizeDate(i.createdAt)));

        return dates;
    }, [quizHistory, interviewHistory]);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const renderCells = () => {
        const cells = [];

        // Empty cells for padding before start of month
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateString = dateObj.toDateString();
            const isActive = activeDays.has(dateString);
            const isToday = new Date().toDateString() === dateString;

            cells.push(
                <div key={day} className="relative h-10 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isActive ? 'bg-green-100 text-green-700 font-bold border border-green-200' : 'text-gray-600 hover:bg-gray-100'}
                    ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                `}>
                        {day}
                        {isActive && (
                            <div className="absolute -top-1 -right-1 bg-white rounded-full">
                                <i className="ri-checkbox-circle-fill text-green-600 text-xs"></i>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <i className="ri-calendar-check-line text-indigo-600"></i>
                    Activity Log
                </h3>
                <div className="flex items-center gap-4 text-sm font-semibold text-gray-700">
                    <button onClick={handlePrevMonth} className="hover:text-indigo-600 p-1">
                        <i className="ri-arrow-left-s-line text-lg"></i>
                    </button>
                    <span>{monthNames[month]} {year}</span>
                    <button onClick={handleNextMonth} className="hover:text-indigo-600 p-1">
                        <i className="ri-arrow-right-s-line text-lg"></i>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderCells()}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <i className="ri-checkbox-circle-fill text-green-600"></i> Activity Recorded
                </span>
            </div>
        </div>
    );
};

export default ProfileCalendar;
