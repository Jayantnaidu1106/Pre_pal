import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    topic: {
        type: String,
        required: true,
        default: 'General Knowledge'
    },
    title: {
        type: String,
        required: false,
        default: ''
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    quizData: {
        type: Array, // Storing the actual quiz questions for review if needed
        default: []
    },
    percentage: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const QuizResult = mongoose.model('quizResult', quizResultSchema);

export default QuizResult;
