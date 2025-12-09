import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import 'remixicon/fonts/remixicon.css';

const Quiz = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [customSubject, setCustomSubject] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!file) {
      setError('Please select a file to begin.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('numQuestions', numQuestions.toString());
    if (customSubject.trim()) {
      formData.append('custom_subject', customSubject.trim());
    }

    try {
      const response = await axios.post('/ai/generate-quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });

      // Handle new response format { subject, questions } or legacy [questions]
      let questions = [];
      let detectedTopic = 'Generated Quiz';

      if (response.data.questions && Array.isArray(response.data.questions)) {
        questions = response.data.questions;
        detectedTopic = response.data.subject || 'Generated Quiz';
      } else if (Array.isArray(response.data)) {
        // Fallback for old API or direct array return
        questions = response.data;
      }

      if (questions.length > 0) {
        setQuiz(questions);
        setSubject(detectedTopic);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
      } else {
        throw new Error('Invalid quiz data received (no questions found).');
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: option
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = async () => {
    let newScore = 0;
    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        newScore++;
      }
    });
    setScore(newScore);
    setShowResults(true);

    try {
      await axios.post('/quiz/result', {
        score: newScore,
        totalQuestions: quiz.length,
        quizData: quiz,
        topic: subject || 'General',
        title: title || (file ? file.name : 'Generated Quiz')
      });
      console.log('Quiz result saved successfully');
    } catch (err) {
      console.error('Failed to save quiz result', err);
      // Don't block UI for this background save
    }
  };

  const handleRetry = () => {
    setFile(null);
    setQuiz([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setError('');
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Generating Quiz...</h2>
          <p className="text-gray-600">AI is analyzing your document</p>
        </div>
      </div>
    );
  }

  // 2. Results State
  if (showResults) {
    const percentage = Math.round((score / quiz.length) * 100);
    let message = "Good effort!";
    if (percentage >= 80) message = "Outstanding!";
    else if (percentage >= 60) message = "Well done!";

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-indigo-600 px-8 py-10 text-center text-white">
              <h2 className="text-3xl font-bold mb-2">{message}</h2>
              <p className="text-indigo-100 text-lg mb-6">You scored {score} out of {quiz.length}</p>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full border-4 border-white/30 text-2xl font-bold">
                {percentage}%
              </div>
            </div>

            <div className="p-8 space-y-6">
              {quiz.map((q, index) => {
                const isCorrect = selectedAnswers[index] === q.answer;
                const userAnswer = selectedAnswers[index];

                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex gap-4">
                      <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {index + 1}
                      </span>
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-800 text-lg mb-4">{q.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, i) => {
                            let statusClass = "bg-white border-gray-200 text-gray-600";
                            if (opt === q.answer) {
                              statusClass = "bg-green-50 border-green-300 text-green-700 font-medium";
                            } else if (opt === userAnswer && opt !== q.answer) {
                              statusClass = "bg-red-50 border-red-300 text-red-700 font-medium";
                            }
                            return (
                              <div key={i} className={`p-3 rounded-lg border text-sm flex justify-between ${statusClass}`}>
                                <span>{opt}</span>
                                {opt === q.answer && <i className="ri-checkbox-circle-line text-lg"></i>}
                                {opt === userAnswer && opt !== q.answer && <i className="ri-close-circle-line text-lg"></i>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md"
                >
                  <i className="ri-refresh-line"></i>
                  Create New Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Upload State (Main Dashboard)
  if (quiz.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-question-answer-line text-green-600"></i>
                AI Quiz Generator
              </h1>
              <p className="text-sm text-gray-500 mt-1">Generate intelligent quizzes from your documents instantly</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center gap-2"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Home
            </button>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-10 border-t-4 border-green-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-file-upload-line text-4xl text-green-600"></i>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Study Material</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Support for PDF and DOCX files. Our AI will analyze the content and create a 5-question quiz for you.
              </p>

              <label
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                  ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <i className="ri-file-text-line text-4xl text-green-600 mb-3"></i>
                      <p className="text-lg font-semibold text-gray-700">{file.name}</p>
                      <p className="text-sm text-green-600 mt-1">Ready to generate</p>
                    </>
                  ) : (
                    <>
                      <i className="ri-cloud-upload-line text-4xl text-gray-400 mb-3"></i>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF or DOCX (Max 10MB)</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
              </label>

              {error && (
                <div className="mt-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                  <i className="ri-error-warning-line"></i> {error}
                </div>
              )}

              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2 text-left">Custom Topic / Title <span className="text-gray-400 font-normal text-sm">(Optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. 'Linear Algebra Midterm' or 'History of Rome'"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>

              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2 text-left">Number of Questions</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-lg w-12 text-center">
                    {numQuestions}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={!file || loading}
                className={`mt-6 w-full py-3 px-6 rounded-lg font-bold text-white transition flex items-center justify-center gap-2
                  ${!file || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'}`}
              >
                {loading ? 'Processing...' : 'Generate Quiz'}
                {!loading && <i className="ri-magic-line"></i>}
              </button>
            </div>

            <p className="mt-8 text-gray-500 text-sm flex items-center justify-center gap-2">
              <i className="ri-shield-check-line text-green-600"></i>
              Powered by advanced RAG & Gemini AI
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Quiz Taking State
  const currentQuestion = quiz[currentQuestionIndex];
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            Question {currentQuestionIndex + 1} / {quiz.length}
          </span>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
            Active Quiz
          </span>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === option;
              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between group
                    ${isSelected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-600'
                    }`}
                >
                  <span className="font-medium text-lg">{option}</span>
                  {isSelected && <i className="ri-checkbox-circle-fill text-indigo-600 text-xl"></i>}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestionIndex]}
              className={`px-8 py-3 rounded-lg font-bold text-white transition flex items-center gap-2
                ${!selectedAnswers[currentQuestionIndex]
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'}`}
            >
              {currentQuestionIndex === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
