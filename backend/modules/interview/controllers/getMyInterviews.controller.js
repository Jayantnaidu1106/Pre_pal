import Interview from '../../../models/interview.model.js';
import InterviewFeedback from '../../../models/interviewFeedback.model.js';

// GET /api/interview/my
export const getMyInterviews = async (req, res) => {
    try {
        // 1. Fetch all interviews for the user
        const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();

        // 2. Fetch all feedbacks for these interviews
        const interviewIds = interviews.map(i => i._id);
        const feedbacks = await InterviewFeedback.find({ interviewId: { $in: interviewIds } }).lean();

        // 3. Map feedback to interviews
        const interviewsWithFeedback = interviews.map(interview => {
            const feedback = feedbacks.find(f => f.interviewId.toString() === interview._id.toString());
            return {
                ...interview,
                feedback: feedback || null // Attach feedback object or null
            };
        });

        return res.status(200).json({ interviews: interviewsWithFeedback });
    } catch (error) {
        console.error('getMyInterviews error:', error);
        return res.status(500).json({ error: 'Failed to fetch interviews' });
    }
};
