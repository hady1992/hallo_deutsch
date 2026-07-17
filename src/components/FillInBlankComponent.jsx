import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioButton from '@/components/AudioButton';

// Note: FillInBlankComponent doesn't typically have multiple choices to shuffle.
// It usually just has an input field.
// However, if the user requested it to "use shuffled answers", it implies it might sometimes
// be used in a context where options are provided, or perhaps the user misunderstood the component type.
// Based on the code provided in <codebase>, this component only has a text input.
// Therefore, answer shuffling is not applicable here as there are no options to shuffle.
// I will keep the component functional but add a comment explaining why shuffling isn't applied.

function FillInBlankComponent({ sentence, correct, hint, index, onAnswer }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (userAnswer.trim()) {
      setSubmitted(true);
      const isCorrect = userAnswer.trim().toLowerCase() === correct.toLowerCase();
      onAnswer(isCorrect);
    }
  };

  const handleReset = () => {
    setUserAnswer('');
    setSubmitted(false);
    setShowHint(false);
  };

  const isCorrect = userAnswer.trim().toLowerCase() === correct.toLowerCase();

  const audioText = sentence.replace('___', ' ... ');
  const correctAudioText = sentence.replace('___', correct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-6 rounded-xl shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          {index + 1}. أكمل الفراغ
        </h3>
        <AudioButton text={submitted && isCorrect ? correctAudioText : audioText} size={20} />
      </div>

      <div className="mb-4">
        <p className="text-lg text-gray-700 mb-4 flex flex-wrap items-center gap-2">
          {sentence.split('___')[0]}
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => !submitted && setUserAnswer(e.target.value)}
            disabled={submitted}
            className={`mx-2 px-3 py-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 ${
              submitted
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="..."
          />
          {sentence.split('___')[1]}
        </p>
      </div>

      <div className="flex gap-3 mb-4">
        {!submitted ? (
          <>
            <Button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              تحقق من الإجابة
            </Button>
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="outline"
            >
              <Lightbulb className="ml-2" size={18} />
              تلميح
            </Button>
          </>
        ) : (
          <Button onClick={handleReset} variant="outline">
            إعادة المحاولة
          </Button>
        )}
      </div>

      {showHint && !submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
        >
          <p className="text-gray-700">
            <Lightbulb className="inline ml-2 text-yellow-600" size={18} />
            {hint}
          </p>
        </motion.div>
      )}

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-start gap-3 ${
            isCorrect ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          {isCorrect ? (
            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
          ) : (
            <XCircle className="text-red-600 flex-shrink-0" size={24} />
          )}
          <div>
            <p className={`font-semibold ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {isCorrect ? '✓ إجابة صحيحة!' : '✗ إجابة خاطئة'}
            </p>
            {!isCorrect && (
              <p className="text-gray-700 mt-2">
                الإجابة الصحيحة: <span className="font-semibold">{correct}</span>
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default FillInBlankComponent;