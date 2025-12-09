import QuizResult from '../../../models/quizResult.model.js';

export const getQuizResult = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const quiz = await QuizResult.findOne({ _id: id, userId });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz result not found' });
        }

        res.status(200).json(quiz);

    } catch (error) {
        console.error('Error fetching quiz result:', error);
        res.status(500).json({ message: 'Failed to fetch quiz result' });
    }
};
