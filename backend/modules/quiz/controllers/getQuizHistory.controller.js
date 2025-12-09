import QuizResult from '../../../models/quizResult.model.js';

export const getQuizHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const history = await QuizResult.find({ userId })
            .sort({ createdAt: -1 }) // Newest first
            .limit(20); // Limit to last 20 attempts for now

        res.status(200).json(history);

    } catch (error) {
        console.error('Error fetching quiz history:', error);
        res.status(500).json({ message: 'Failed to fetch quiz history' });
    }
};
