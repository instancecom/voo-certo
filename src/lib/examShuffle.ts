import { DbQuestion } from '@/hooks/useExams';

export interface ShuffledQuestion extends DbQuestion {
  /** The shuffled options displayed to the user */
  shuffledOptions: string[];
  /** Maps shuffled index → original index. E.g. optionMap[0] = 2 means displayed option A was originally option C */
  optionMap: number[];
  /** The correct answer index in the SHUFFLED order */
  shuffledCorrectAnswer: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffles options within a question, tracking the correct answer.
 */
function shuffleQuestionOptions(question: DbQuestion): ShuffledQuestion {
  const options = question.options as string[];
  // Create indices [0,1,2,3] and shuffle them
  const indices = options.map((_, i) => i);
  const shuffledIndices = shuffleArray(indices);

  const shuffledOptions = shuffledIndices.map(i => options[i]);
  const shuffledCorrectAnswer = shuffledIndices.indexOf(question.correct_answer);

  return {
    ...question,
    shuffledOptions,
    optionMap: shuffledIndices,
    shuffledCorrectAnswer,
  };
}

/**
 * Groups questions by block, keeps block order fixed,
 * shuffles questions within each block, and shuffles each question's options.
 */
export function prepareExamQuestions(
  questions: DbQuestion[],
  selectedBlock?: number
): ShuffledQuestion[] {
  // Filter by selected block if specified
  const filtered = selectedBlock
    ? questions.filter(q => q.block_number === selectedBlock)
    : questions;

  // Group by block_number
  const blockMap = new Map<number, DbQuestion[]>();
  filtered.forEach(q => {
    const block = q.block_number ?? 0;
    if (!blockMap.has(block)) blockMap.set(block, []);
    blockMap.get(block)!.push(q);
  });

  // Sort blocks in fixed order
  const sortedBlocks = [...blockMap.keys()].sort((a, b) => a - b);

  // Shuffle within each block, then shuffle options
  const result: ShuffledQuestion[] = [];
  for (const blockNum of sortedBlocks) {
    const blockQuestions = shuffleArray(blockMap.get(blockNum)!);
    for (const q of blockQuestions) {
      result.push(shuffleQuestionOptions(q));
    }
  }

  return result;
}

/**
 * For Banca ANAC mode: prepares all questions with auto-distribution into 4 blocks if needed.
 */
export function prepareBancaQuestions(questions: DbQuestion[]): ShuffledQuestion[] {
  const hasBlockNumbers = questions.some(q => q.block_number !== null && q.block_number !== undefined);

  if (hasBlockNumbers) {
    return prepareExamQuestions(questions);
  }

  // Auto-distribute into 4 blocks of 20
  const QUESTIONS_PER_BLOCK = 20;
  const shuffled = shuffleArray(questions);
  const withBlocks: DbQuestion[] = shuffled.map((q, i) => ({
    ...q,
    block_number: Math.floor(i / QUESTIONS_PER_BLOCK) + 1,
  }));

  return prepareExamQuestions(withBlocks);
}
