export interface Question {
  id: string;
  category: string;
  subcategory: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  audioUrl?: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

export interface Exam {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  duration: number; // in minutes
  questionCount: number;
  questions: string[]; // question IDs
  randomOrder: boolean;
  isPremium: boolean;
  icon: string;
  color: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  completedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface UserProgress {
  userId: string;
  categoryId: string;
  subcategoryId: string;
  totalExams: number;
  averageScore: number;
  lastExamDate: Date;
}
