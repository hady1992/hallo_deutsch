/**
 * Shuffles an array of answer options and tracks the correct answer.
 * 
 * @param {Array} options - The array of answer options to shuffle.
 * @param {number|string} correctAnswer - The index of the correct answer (if number) or the value (if string).
 * @returns {Object} An object containing:
 *  - shuffledOptions: The shuffled array of options.
 *  - newCorrectAnswer: The new index (if input was index) or the value (if input was value) of the correct answer.
 */
export const shuffleAnswers = (options, correctAnswer) => {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return { shuffledOptions: [], newCorrectAnswer: correctAnswer };
  }

  // Create an array of indices [0, 1, 2, ...]
  const indices = options.map((_, i) => i);

  // Shuffle the indices using Fisher-Yates algorithm
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Create the shuffled options array based on the shuffled indices
  const shuffledOptions = indices.map(i => options[i]);

  let newCorrectAnswer;

  // If correctAnswer is a number (index-based system)
  if (typeof correctAnswer === 'number') {
    // Find where the original correct index moved to
    // The original correct index is 'correctAnswer'
    // We need to find 'k' such that indices[k] === correctAnswer
    newCorrectAnswer = indices.indexOf(correctAnswer);
  } else {
    // If correctAnswer is a value (string/value-based system), it remains the same value,
    // but the shuffled options array is just reordered.
    // The validation logic usually compares values directly in these cases.
    newCorrectAnswer = correctAnswer;
  }

  return {
    shuffledOptions,
    newCorrectAnswer
  };
};