import QuizResult from '../../../models/quizResult.model.js';

export const saveQuizResult = async (req, res) => {
    try {
        const { score, totalQuestions, quizData, topic } = req.body;
        const userId = req.user._id;

        if (score === undefined || totalQuestions === undefined) {
            return res.status(400).json({ message: 'Score and total questions are required' });
        }

        const percentage = Math.round((score / totalQuestions) * 100);

        const newResult = new QuizResult({
            userId,
            score,
            totalQuestions,
            percentage,
            quizData: quizData || [],
            topic: topic || 'General Quiz'
        });

        await newResult.save();

        res.status(201).json({
            message: 'Quiz result saved successfully',
            result: newResult
        });

    } catch (error) {
        console.error('Error saving quiz result:', error);
        res.status(500).json({ message: 'Failed to save quiz result' });
    }
};
