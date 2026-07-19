import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioButton from '@/components/AudioButton';
import { shuffleAnswers } from '@/utils/answerShuffler';
import BidiText from '@/components/common/BidiText';

function QuestionComponent({ question, options, correct, index, onAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [currentCorrectIndex, setCurrentCorrectIndex] = useState(0);

  useEffect(() => {
    // Shuffle options when component mounts or props change (new question)
    // Note: 'correct' prop is an index here
    const { shuffledOptions, newCorrectAnswer } = shuffleAnswers(options, correct);
    setCurrentOptions(shuffledOptions);
    setCurrentCorrectIndex(newCorrectAnswer);

    // Reset state for new question
    setSelectedAnswer(null);
    setSubmitted(false);
  }, [question, options, correct]);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setSubmitted(true);
      onAnswer(selectedAnswer === currentCorrectIndex);
    }
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  // If we haven't processed options yet, don't render or render loading
  if (currentOptions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-6 rounded-xl shadow-md"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span className="shrink-0 text-xl font-bold text-gray-800">{index + 1}.</span>
          <BidiText as="h3" text={question} className="text-xl font-bold text-gray-800 flex-1" />
        </div>
        <AudioButton text={question} size={20} />
      </div>

      <div className="space-y-3 mb-4">
        {currentOptions.map((option, optionIndex) => (
          <label
            key={optionIndex}
            className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
              submitted
                ? optionIndex === currentCorrectIndex
                  ? 'bg-green-100 border-2 border-green-500'
                  : optionIndex === selectedAnswer
                  ? 'bg-red-100 border-2 border-red-500'
                  : 'bg-gray-50'
                : selectedAnswer === optionIndex
                ? 'bg-red-100 border-2 border-red-500'
                : 'bg-gray-50 hover:bg-red-50'
            }`}
          >
            <input
              type="radio"
              name={`question-${index}`}
              checked={selectedAnswer === optionIndex}
              onChange={() => !submitted && setSelectedAnswer(optionIndex)}
              disabled={submitted}
              className="ml-3"
            />
            <div className="flex items-center gap-2 flex-grow">
               <BidiText as="span" text={option} className="text-gray-800 flex-1" />
               <AudioButton text={option} size={16} />
            </div>

            {submitted && optionIndex === currentCorrectIndex && (
              <CheckCircle className="text-green-600" size={24} />
            )}
            {submitted && optionIndex === selectedAnswer && optionIndex !== currentCorrectIndex && (
              <XCircle className="text-red-600" size={24} />
            )}
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="bg-red-600 hover:bg-red-700"
          >
            تحقق من الإجابة
          </Button>
        ) : (
          <Button onClick={handleReset} variant="outline">
            إعادة المحاولة
          </Button>
        )}
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-lg ${
            selectedAnswer === currentCorrectIndex ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <p className={`font-semibold ${
            selectedAnswer === currentCorrectIndex ? 'text-green-700' : 'text-red-700'
          }`}>
            {selectedAnswer === currentCorrectIndex ? '✓ إجابة صحيحة!' : '✗ إجابة خاطئة'}
          </p>
          {selectedAnswer !== currentCorrectIndex && (
            <p className="text-gray-700 mt-2">
              الإجابة الصحيحة: {currentOptions[currentCorrectIndex]}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default QuestionComponent;
